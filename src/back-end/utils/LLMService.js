const { GoogleGenerativeAI } = require('@google/generative-ai');
const { redisClient } = require('../config/redis.config');
const Branch = require('../models/Branch');

// Import RAG services (lazy loading để tránh lỗi circular dependencies)
let MovieRetrieverService, ScheduleRetrieverService;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const createMasterPrompt = (userQuery, conversationContext = null) => {
    const contextInfo = conversationContext
        ? `
CONVERSATION CONTEXT:
- Previous intent: ${conversationContext.lastIntent || 'none'}
- Extracted entities: ${JSON.stringify(conversationContext.entities || {})}
- Missing parameters: ${JSON.stringify(conversationContext.missingParams || [])}
- Conversation step: ${conversationContext.step || 'initial'}
- Last question asked: ${conversationContext.lastQuestion || 'none'}
`
        : '';

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const saturdayFormatted = nextSaturday.toISOString().split('T')[0];

    return `
    Bạn là AI Assistant chuyên nghiệp của Lumiere Cinema. Nhiệm vụ chính là phục vụ 5 CHỨC NĂNG CỐT LÕI về phim ảnh.

    ### THÔNG TIN NGÀY HIỆN TẠI (HỆ THỐNG):
    - Hôm nay: ${todayFormatted}
    - Ngày mai: ${tomorrowFormatted}  
    - Thứ 7 tiếp theo: ${saturdayFormatted}

    ### THÔNG TIN CÁC CHI NHÁNH LUMIERE CINEMA:
    - "Nguyễn Văn Cừ" (Chi nhánh chính)
    - "Nguyễn Huệ" (Trung tâm thành phố)  
    - "Huỳnh Tấn Phát" (Quận 7)

    ${contextInfo}

    ### 5 CHỨC NĂNG CỐT LÕI (LUÔN ƯU TIÊN):
    1. **searchMovie**: Tìm phim theo tên, diễn viên, thể loại
    2. **get_upcoming_movies**: Lấy danh sách phim sắp chiếu  
    3. **get_now_showing_movies**: Lấy phim đang chiếu hiện tại
    4. **getMovieDetail**: Xem chi tiết thông tin phim cụ thể
    5. **getScheduleByBranch**: Tìm lịch chiếu theo rạp (cần: movie_title, location, date)

    ### XỬ LÝ CÂU HỎI KHÔNG LIÊN QUAN PHIM:
    - Nếu câu hỏi về: thời tiết, tin tức, toán học, lập trình, v.v. => intent: "non_movie_related"
    - Luôn hướng người dùng quay lại chủ đề phim ảnh một cách lịch sự
    - Không cung cấp thông tin ngoài lĩnh vực rạp phim

    ### CONVERSATION STATE MANAGEMENT:
    - Nếu đang trong luồng getScheduleByBranch và thiếu tham số => tiếp tục thu thập
    - Phát hiện khi người dùng chuyển đổi chủ đề => reset context
    - Nhớ các thông tin đã thu thập để không hỏi lại

    ### INTENT CLASSIFICATION (CHÍNH XÁC 100%):
      **Core Movie Functions:**
    - "search_movies": Tìm phim theo tên cụ thể ("tìm phim Avatar", "có phim gì của Tom Cruise")
    - "search_conversation": Câu hỏi tìm kiếm chung chung, không cụ thể ("tìm phim hay", "phim gì hay", "gợi ý phim")
    - "get_now_showing": Lấy danh sách phim đang chiếu ("phim gì đang chiếu", "phim nào hot hiện tại")  
    - "get_upcoming": Lấy phim sắp chiếu ("phim sắp ra", "tháng tới có phim gì")
    - "movie_details": Chi tiết phim ("thông tin phim X", "phim này nói về gì")
    - "schedule_conversation": Hỏi lịch chiếu chung chung, chưa có tên phim cụ thể ("xem lịch chiếu", "lịch chiếu", "suất chiếu")
    - "find_schedules": Lịch chiếu phim - CẦN ĐỦ 3 THAM SỐ: movie_title, location, date
    
    **Non-Movie Related (REJECT):**
    - "non_movie_related": Mọi chủ đề ngoài phim (thời tiết, tin tức, toán, etc.)

    ### ENTITY EXTRACTION (SIÊU THÔNG MINH):
    **Movie Title Normalization & Multi-field Search:**
    - "Avata" -> "Avatar", "người sắt" -> "Iron Man"
    - "phim của DiCaprio" -> search by actor: "Leonardo DiCaprio"
    - "phim siêu anh hùng" -> search by genre: "Action" or "Superhero"
    - "phim hành động" -> search by genre: "Action"
    - "phim kinh dị" -> search by genre: "Horror"
    - "phim tình cảm" -> search by genre: "Romance"
    - "phim của Marvel" -> search by keyword: "Marvel"
    - "phim Christopher Nolan" -> search by director: "Christopher Nolan"
    **Location Standardization (CHI NHÁNH LUMIERE CINEMA):**
    - "Nguyễn Văn Cừ", "chi nhánh chính", "rạp chính" -> "Nguyễn Văn Cừ"
    - "Nguyễn Huệ", "trung tâm", "downtown", "quận 1" -> "Nguyễn Huệ"
    - "Huỳnh Tấn Phát", "quận 7", "Q7", "phú mỹ hưng" -> "Huỳnh Tấn Phát"
    - "gần tôi", "gần nhất" -> location_request (hỏi thêm thông tin)
    **Smart Date Processing:**
    - "hôm nay" -> ${todayFormatted}
    - "mai", "ngày mai" -> ${tomorrowFormatted}
    - "cuối tuần", "weekend" -> ${saturdayFormatted} (thứ 7 tiếp theo)
    - "thứ bảy" -> ${saturdayFormatted}
    - "25/7" -> "2025-07-25" (chuyển đổi DD/MM thành YYYY-MM-DD)
    - "ngày 25 tháng 7" -> "2025-07-25"

    ### JSON OUTPUT STRUCTURE:
    {
      "intent": "intent_name",
      "entities": {
        "movie_title": "string or null",
        "search_keyword": "string or null",
        "search_type": "title|actor|director|genre|keyword",
        "location": "string or null", 
        "date": "string or null"
      },
      "context": {
        "needs_followup": true/false,
        "missing_params": ["param1", "param2"],
        "next_question": "next_param_to_ask"
      },
      "confidence": 0.95
    }

    ### EXAMPLES:
    **1. Get Now Showing:**
    User: "Có phim gì hay đang chiếu không?"
    => { "intent": "get_now_showing", "entities": {}, "context": {"needs_followup": false}, "confidence": 0.95 }
    **2. Search Movie (Specific):**
    User: "Tìm phim Avatar cho tôi"
    => { "intent": "search_movies", "entities": { "movie_title": "Avatar", "search_type": "title" }, "context": {"needs_followup": false}, "confidence": 0.95 }
    **2b. Search Conversation (General):**
    User: "Tìm phim hay"
    => { "intent": "search_conversation", "entities": {}, "context": {"needs_followup": false}, "confidence": 0.95 }
    **2c. Search by Actor:**
    User: "Có phim gì của Tom Cruise không?"
    => { "intent": "search_movies", "entities": { "search_keyword": "Tom Cruise", "search_type": "actor" }, "context": {"needs_followup": false}, "confidence": 0.94 }
    **2d. Search by Genre:**
    User: "Tìm phim hành động hay"
    => { "intent": "search_movies", "entities": { "search_keyword": "Action", "search_type": "genre" }, "context": {"needs_followup": false}, "confidence": 0.93 }
    **3. Schedule Conversation (General):**
    User: "Xem lịch chiếu"
    => { "intent": "schedule_conversation", "entities": {}, "context": {"needs_followup": false}, "confidence": 0.95 }
    **4. Schedule - Missing All:**
    User: "Tôi muốn xem lịch chiếu"
    => { "intent": "find_schedules", "entities": {}, "context": { "needs_followup": true, "missing_params": ["movie_title", "location", "date"], "next_question": "movie_title" }, "confidence": 0.90 }
    **5. Schedule with Branch:**
    User: "Lịch chiếu phim Avatar ở Nguyễn Văn Cừ"
    => { "intent": "find_schedules", "entities": {"movie_title": "Avatar", "location": "Nguyễn Văn Cừ"}, "context": { "needs_followup": true, "missing_params": ["date"], "next_question": "date" }, "confidence": 0.92 }
    **6. Schedule with all params:**
    User: "Lịch chiếu Avatar ở Nguyễn Huệ hôm nay"
    => { "intent": "find_schedules", "entities": { "movie_title": "Avatar", "location": "Nguyễn Huệ", "date": "${todayFormatted}" }, "context": {"needs_followup": false}, "confidence": 0.95 }
    **7. Non-Movie:**
    User: "Hôm nay thời tiết thế nào?"
    => { "intent": "non_movie_related", "entities": {}, "context": {"needs_followup": false}, "confidence": 0.98 }
    **8. Date Context Examples:**
    User: "Lịch chiếu Avatar hôm nay"
    => { "intent": "find_schedules", "entities": {"movie_title": "Avatar", "date": "${todayFormatted}"}, "context": { "needs_followup": true, "missing_params": ["location"], "next_question": "location" }, "confidence": 0.92 }

    USER QUERY: "${userQuery}"
    
    Trả về JSON CHÍNH XÁC cho query trên:`;
};

const analyzeQuery = async (userQuery, sessionId = null, conversationContext = null) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY không được tìm thấy trong biến môi trường');
        }

        const shouldCache = !conversationContext || !conversationContext.lastIntent;
        let cacheKey = null;

        if (shouldCache) {
            cacheKey = `analysis:${Buffer.from(userQuery.toLowerCase().trim()).toString('base64')}`;
            const cachedResult = await redisClient.get(cacheKey);
            if (cachedResult) {
                return JSON.parse(cachedResult);
            }
        }

        const masterPrompt = createMasterPrompt(userQuery, conversationContext);
        const result = await model.generateContent(masterPrompt);
        const response = await result.response;
        const text = response.text();

        let parsedResult = parseGeminiResponse(text);
        parsedResult = applyPostProcessingRules(parsedResult, userQuery, conversationContext);

        if (shouldCache && cacheKey) {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(parsedResult));
        }

        return parsedResult;
    } catch (error) {
        console.error('❌ Error in analyzeQuery:', error);
        return performFallbackAnalysis(userQuery, conversationContext);
    }
};

function parseGeminiResponse(text) {
    let cleanedText = text.replace(/```json|```/g, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch (e1) {
        // Fallback strategy
    }
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e2) {
            // Fallback strategy
        }
    }
    try {
        let fixedJson = cleanedText.replace(/,(\s*[}\]])/g, '$1');
        fixedJson = fixedJson.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
        return JSON.parse(fixedJson);
    } catch (e3) {
        // Fallback strategy
    }
    return createFallbackStructure(text);
}

function createFallbackStructure(text) {
    const lowerText = text.toLowerCase();
    let intent = 'greeting';
    if (lowerText.includes('search') || lowerText.includes('tìm')) intent = 'search_movies';
    if (lowerText.includes('now_showing') || lowerText.includes('đang chiếu')) intent = 'get_now_showing';
    if (lowerText.includes('upcoming') || lowerText.includes('sắp chiếu')) intent = 'get_upcoming';
    if (lowerText.includes('schedule') || lowerText.includes('lịch chiếu')) intent = 'find_schedules';
    if (lowerText.includes('detail') || lowerText.includes('chi tiết')) intent = 'movie_details';
    return { intent: intent, entities: {}, context: { needs_followup: false }, confidence: 0.3, fallback: true };
}

function applyPostProcessingRules(result, userQuery, conversationContext) {
    const lowerQuery = userQuery.toLowerCase().trim();
    if (conversationContext && conversationContext.lastIntent === 'find_schedules') {
        const hasScheduleContext = conversationContext.missingParams && conversationContext.missingParams.length > 0;
        if (hasScheduleContext && !['find_schedules', 'non_movie_related'].includes(result.intent)) {
            result.intent = 'find_schedules';
            const nextMissingParam = conversationContext.missingParams[0];
            if (nextMissingParam === 'location') result.entities.location = extractLocationFromQuery(userQuery);
            if (nextMissingParam === 'date') result.entities.date = extractDateFromQuery(userQuery);
            if (nextMissingParam === 'movie_title') result.entities.movie_title = userQuery.trim();
        }
    }
    if (conversationContext && conversationContext.lastIntent === 'schedule_conversation') {
        if (!['non_movie_related', 'greeting'].includes(result.intent)) {
            result.intent = 'search_for_schedule';
            result.entities.movie_title = userQuery.trim();
            result.entities.search_type = 'title';
        }
    }
    const nonMovieKeywords = [
        'thời tiết',
        'tin tức',
        'toán học',
        'lập trình',
        'chính trị',
        'kinh tế',
        'thể thao',
        'nấu ăn',
    ];
    if (nonMovieKeywords.some(keyword => lowerQuery.includes(keyword))) {
        result.intent = 'non_movie_related';
        result.entities = {};
    }
    const intentMappings = {
        find_movies: lowerQuery.includes('sắp chiếu') ? 'get_upcoming' : 'get_now_showing',
        get_movies: lowerQuery.includes('sắp chiếu') ? 'get_upcoming' : 'get_now_showing',
    };
    if (intentMappings[result.intent]) {
        result.intent = intentMappings[result.intent];
    }
    if (result.entities) {
        if (result.entities.location) result.entities.location = normalizeLocation(result.entities.location);
        if (result.entities.date) result.entities.date = normalizeDateInput(result.entities.date);
    }
    return result;
}

function normalizeLocation(location) {
    if (!location) return null;
    const lowerLocation = location.toLowerCase();
    if (
        lowerLocation.includes('nguyễn văn cừ') ||
        lowerLocation.includes('chi nhánh chính') ||
        lowerLocation.includes('rạp chính')
    )
        return 'Nguyễn Văn Cừ';
    if (
        lowerLocation.includes('nguyễn huệ') ||
        lowerLocation.includes('trung tâm') ||
        lowerLocation.includes('downtown') ||
        lowerLocation.includes('quận 1')
    )
        return 'Nguyễn Huệ';
    if (
        lowerLocation.includes('huỳnh tấn phát') ||
        lowerLocation.includes('quận 7') ||
        lowerLocation.includes('q7') ||
        lowerLocation.includes('phú mỹ hưng')
    )
        return 'Huỳnh Tấn Phát';
    return location;
}

function extractLocationFromQuery(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('nguyễn văn cừ') || lowerQuery.includes('chính')) return 'Nguyễn Văn Cừ';
    if (lowerQuery.includes('nguyễn huệ') || lowerQuery.includes('quận 1')) return 'Nguyễn Huệ';
    if (lowerQuery.includes('huỳnh tấn phát') || lowerQuery.includes('quận 7')) return 'Huỳnh Tấn Phát';
    return query.trim();
}

function extractDateFromQuery(query) {
    const lowerQuery = query.toLowerCase();
    const today = new Date();
    if (lowerQuery.includes('hôm nay')) return today.toISOString().split('T')[0];
    if (lowerQuery.includes('mai') || lowerQuery.includes('ngày mai')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    const dateMatch = query.match(/(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        return `${today.getFullYear()}-${month}-${day}`;
    }
    return query.trim();
}

function normalizeDateInput(dateInput) {
    if (!dateInput) return null;
    const today = new Date();
    const lowerDate = dateInput.toLowerCase();
    if (lowerDate.includes('hôm nay')) return today.toISOString().split('T')[0];
    if (lowerDate.includes('mai')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
    const dateMatch = dateInput.match(/(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        return `${today.getFullYear()}-${month}-${day}`;
    }
    return dateInput;
}

function performFallbackAnalysis(userQuery, conversationContext) {
    const lowerQuery = userQuery.toLowerCase().trim();
    const result = {
        intent: 'greeting',
        entities: {},
        context: { needs_followup: false },
        confidence: 0.2,
        fallback: true,
    };
    if (lowerQuery.includes('phim gì') || lowerQuery.includes('có phim')) {
        result.intent = lowerQuery.includes('sắp') ? 'get_upcoming' : 'get_now_showing';
    } else if (lowerQuery.includes('tìm') || lowerQuery.includes('search')) {
        result.intent = 'search_movies';
        const titleMatch = lowerQuery.match(/tìm.+?(phim\s+)?(.+)/);
        if (titleMatch && titleMatch[2]) result.entities.movie_title = titleMatch[2].trim();
    } else if (lowerQuery === 'xem lịch chiếu' || lowerQuery === 'lịch chiếu') {
        result.intent = 'schedule_conversation';
        result.confidence = 0.8;
    } else if (lowerQuery.includes('lịch chiếu') || lowerQuery.includes('suất chiếu')) {
        result.intent = 'find_schedules';
        result.context.needs_followup = true;
    } else if (lowerQuery.includes('chi tiết') || lowerQuery.includes('thông tin')) {
        result.intent = 'movie_details';
    }
    if (
        conversationContext &&
        conversationContext.lastIntent === 'find_schedules' &&
        conversationContext.missingParams
    ) {
        result.intent = 'find_schedules';
        const missing = conversationContext.missingParams[0];
        if (missing === 'location') result.entities.location = extractLocationFromQuery(userQuery);
        else if (missing === 'date') result.entities.date = extractDateFromQuery(userQuery);
        else if (missing === 'movie_title') result.entities.movie_title = userQuery.trim();
    }
    return result;
}

async function analyzeQueryWithRAG(userQuery, sessionId, conversationContext = null) {
    try {
        const traditionalAnalysis = await analyzeQuery(userQuery, sessionId, conversationContext);
        const shouldUseRAG = ['search_movies', 'find_schedules', 'movie_details'].includes(traditionalAnalysis.intent);
        if (!shouldUseRAG) {
            return traditionalAnalysis;
        }
        const ragContext = await gatherRAGContext(traditionalAnalysis);
        return { ...traditionalAnalysis, ragContext, useRAG: true };
    } catch (error) {
        console.error('Error in RAG analysis:', error);
        return await analyzeQuery(userQuery, sessionId, conversationContext);
    }
}

// ======================= HÀM ĐÃ ĐƯỢC SỬA LỖI HOÀN CHỈNH =======================
async function gatherRAGContext(analysis) {
    try {
        const analysisObj = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
        const context = {
            movies: [],
            schedules: [],
            relevantInfo: [],
            metadata: {
                intent: analysisObj.intent || 'unknown',
                entities: analysisObj.entities || {},
                confidence: analysisObj.confidence || 0,
            },
        };
        if (!MovieRetrieverService) {
            MovieRetrieverService = require('./movieRetrieverService');
            ScheduleRetrieverService = require('./scheduleRetrieverService');
        }
        const movieRetriever = new MovieRetrieverService();
        const scheduleRetriever = new ScheduleRetrieverService();
        switch (analysisObj.intent) {
            case 'search_movies': {
                try {
                    context.movies = await movieRetriever.searchMovies(analysisObj, { limit: 5 });
                } catch (error) {
                    console.error('Error fetching movies in gatherRAGContext:', error);
                    context.movies = [];
                }
                break;
            }
            case 'find_schedules': {
                try {
                    const entities = analysisObj.entities || {};
                    let movieId = entities.movie_id;
                    let branchId = entities.branch_id;

                    // Logic mới: Tự động chuyển đổi tên thành ID
                    if (!movieId && entities.movie_title) {
                        const movies = await movieRetriever.fallbackMovieSearch(entities.movie_title, { limit: 1 });
                        if (movies.length > 0) {
                            movieId = movies[0]._id;
                            context.movies = movies;
                        }
                    }
                    if (!branchId && entities.location) {
                        const branch = await Branch.findOne({
                            name: { $regex: new RegExp(entities.location, 'i') },
                        }).lean();
                        if (branch) {
                            branchId = branch._id;
                        }
                    }
                    if (movieId || branchId || entities.date) {
                        context.schedules = await scheduleRetriever.getSchedulesByFilters({
                            movieId: movieId,
                            branchId: branchId,
                            date: entities.date,
                            limit: 10,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching schedules in gatherRAGContext:', error);
                    context.schedules = [];
                }
                break;
            }
            case 'movie_details': {
                try {
                    const entities = analysisObj.entities || {};
                    if (entities.movie_title) {
                        const movieSearchAnalysis = {
                            intent: 'search_movies',
                            entities: { movie_title: entities.movie_title, search_type: 'title' },
                        };
                        const movies = await movieRetriever.searchMovies(movieSearchAnalysis, { limit: 1 });
                        if (movies && movies.length > 0) {
                            context.movies = movies;
                            context.schedules = await scheduleRetriever.getSchedulesByFilters({
                                movieId: movies[0]._id,
                                limit: 10,
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching movie details in gatherRAGContext:', error);
                    context.movies = [];
                }
                break;
            }
        }
        context.summary = {
            movieCount: context.movies.length,
            scheduleCount: context.schedules.length,
            hasRelevantData: context.movies.length > 0 || context.schedules.length > 0,
        };
        return context;
    } catch (error) {
        console.error('Error gathering RAG context:', error);
        return { movies: [], schedules: [], relevantInfo: [], summary: { hasRelevantData: false } };
    }
}
// =====================================================================

async function generateRAGResponse(analysis, ragContext, originalQuery) {
    try {
        if (!analysis.useRAG || !ragContext.summary.hasRelevantData) {
            return null;
        }
        const contextPrompt = buildRAGContextPrompt(ragContext, originalQuery, analysis);
        const prompt = `${contextPrompt}
    User Query: "${originalQuery}"
    Intent: ${analysis.intent}
    Entities: ${JSON.stringify(analysis.entities)}
    Based on the above context and search results, provide a helpful and accurate response.
    Include specific movie titles, schedules, and details from the retrieved data.
    Keep the response natural and conversational in Vietnamese.
    Format your response as JSON with:
    - type: response type
    - message: main response message
    - data: relevant structured data
    - suggestions: follow-up action suggestions
    `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        try {
            const parsedResponse = JSON.parse(text);
            parsedResponse.ragEnhanced = true;
            parsedResponse.dataSource = 'vector_search';
            return parsedResponse;
        } catch (parseError) {
            return {
                type: 'rag_response',
                message: text,
                ragEnhanced: true,
                dataSource: 'vector_search',
                data: ragContext,
            };
        }
    } catch (error) {
        console.error('Error generating RAG response:', error);
        return null;
    }
}

function buildRAGContextPrompt(ragContext, query, analysis) {
    let contextPrompt = 'RETRIEVED CONTEXT FROM LUMIERE CINEMA DATABASE:\n\n';
    if (ragContext.movies.length > 0) {
        contextPrompt += 'RELEVANT MOVIES:\n';
        ragContext.movies.forEach((movie, index) => {
            contextPrompt += `${index + 1}. ${movie.title}
   - Genre: ${movie.genreString || 'N/A'}
   - Director: ${movie.director || 'N/A'}
   - Cast: ${movie.castString || 'N/A'}
   - Rating: ${movie.ratingsAverage || 'N/A'}/10
   - Status: ${movie.status || 'N/A'}
   - Duration: ${movie.durationFormatted || movie.duration + ' min' || 'N/A'}
   - Release Date: ${movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'N/A'}
   - Description: ${movie.description ? movie.description.substring(0, 200) + '...' : 'N/A'}
`;
        });
    }
    if (ragContext.schedules.length > 0) {
        contextPrompt += '\nRELEVANT SCHEDULES:\n';
        ragContext.schedules.forEach((schedule, index) => {
            contextPrompt += `${index + 1}. ${schedule.movie.title}
   - Cinema: ${schedule.branch.name}
   - Address: ${schedule.branch.address}
   - Screen: ${schedule.screen.screenName}
   - Date: ${schedule.dateFormatted}
   - Time: ${schedule.timeFormatted}
   - Available Seats: ${schedule.availableSeats}/${schedule.screen.totalSeats}
`;
        });
    }
    contextPrompt += `\nSEARCH CONTEXT:
- Query analyzed as: ${analysis.intent}
- Found ${ragContext.movies.length} relevant movies
- Found ${ragContext.schedules.length} relevant schedules
- User query: "${query}"

INSTRUCTIONS:
- Use the retrieved data to provide accurate, specific answers
- Reference actual movie titles, schedules, and cinema information
- If data is incomplete, ask for clarification
- Provide actionable next steps
`;
    return contextPrompt;
}

module.exports = {
    analyzeQuery,
    analyzeQueryWithRAG,
    generateRAGResponse,
    gatherRAGContext,
};
