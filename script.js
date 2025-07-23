// // Precompiled regex patterns for better performance
// const arabicNormalizationPatterns = {
//     alefVariants: /[إأٱآ]/g,
//     yehVariants: /ى/g,
//     tehVariants: /ة/g,
//     diacritics: /[\u064B-\u065F\u0670]/g,
//     tatweel: /\u0640/g,
//     abdSpace: /(عبد)\s(ال)/g
// };

// // Memoization cache for normalized strings
// const normalizationCache = new Map();

// function normalizeArabic(text) {
//     if (!text) return '';
    
//     // Check cache first
//     const cached = normalizationCache.get(text);
//     if (cached !== undefined) return cached;
    
//     const normalized = text
//         .toString()
//         .replace(arabicNormalizationPatterns.alefVariants, 'ا')
//         .replace(arabicNormalizationPatterns.yehVariants, 'ي')
//         .replace(arabicNormalizationPatterns.tehVariants, 'ه')
//         .replace(arabicNormalizationPatterns.diacritics, '')
//         .replace(arabicNormalizationPatterns.tatweel, '')
//         .replace(arabicNormalizationPatterns.abdSpace, '$1$2')
//         .toLowerCase();
    
//     // Cache the result
//     normalizationCache.set(text, normalized);
//     return normalized;
// }

// // Pre-processed student data with normalized names
// let processedStudentsData = [];

// // Load and prepare the JSON data
// fetch('data/results.json')
//     .then(response => response.json())
//     .then(data => {
//         if (!Array.isArray(data)) {
//             throw new Error('Invalid data format: expected array');
//         }
        
//         // Pre-process all data at load time
//         processedStudentsData = data.map(student => ({
//             ...student,
//             normalizedName: normalizeArabic(student.arabic_name || '')
//         }));
        
//         console.log('Data loaded and processed successfully');
//     })
//     .catch(error => {
//         console.error('Error loading data:', error);
//         document.getElementById('resultsContainer').innerHTML = 
//             '<div class="no-results">حدث خطأ في تحميل البيانات</div>';
//     });

// // Debounce search to prevent rapid successive searches
// let searchDebounceTimer;
// const DEBOUNCE_DELAY = 300;

// function searchResults() {
//     clearTimeout(searchDebounceTimer);
//     searchDebounceTimer = setTimeout(() => {
//         performSearch();
//     }, DEBOUNCE_DELAY);
// }

// function performSearch() {
//     const searchTerm = document.getElementById('searchInput').value.trim();
//     const resultsContainer = document.getElementById('resultsContainer');
//     const loading = document.getElementById('loading');
    
//     if (searchTerm === '') {
//         resultsContainer.innerHTML = '<div class="no-results">الرجاء إدخال اسم للبحث</div>';
//         return;
//     }
    
//     loading.style.display = 'block';
//     resultsContainer.innerHTML = '';
    
//     // Use requestAnimationFrame for smoother UI updates
//     requestAnimationFrame(() => {
//         if (processedStudentsData.length === 0) {
//             loading.style.display = 'none';
//             resultsContainer.innerHTML = '<div class="no-results">لم يتم تحميل البيانات بعد</div>';
//             return;
//         }
        
//         const normalizedSearchTerm = normalizeArabic(searchTerm);
//         const searchTermLength = normalizedSearchTerm.length;
        
//         // Optimized search with pre-normalized data
//         const results = processedStudentsData.filter(student => {
//             if (!student.normalizedName) return false;
            
//             // Use indexOf for better performance than includes
//             return student.normalizedName.indexOf(normalizedSearchTerm) !== -1;
            
//             // For more flexible matching (optional):
//             // return student.normalizedName.includes(normalizedSearchTerm) || 
//             //        student.normalizedName.split(' ').some(part => 
//             //            part.indexOf(normalizedSearchTerm) !== -1
//             //        );
//         });
        
//         loading.style.display = 'none';
        
//         if (results.length === 0) {
//             resultsContainer.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة للبحث</div>';
//             return;
//         }
        
//         // Use document fragment for efficient DOM updates
//         const fragment = document.createDocumentFragment();
        
//         results.slice(0, 100).forEach(student => { // Limit to 100 results for performance
//             const div = document.createElement('div');
//             div.className = 'result-item';
//             div.innerHTML = `
//                 <h3>${student.arabic_name || 'غير معروف'}</h3>
//                 <p>رقم الهوية: ${student.seating_no || 'غير متوفر'}</p>
//                 <p>النتيجة: ${student.total_degree || 'غير متوفر'}</p>
//             `;
//             fragment.appendChild(div);
//         });
        
//         resultsContainer.innerHTML = '';
//         resultsContainer.appendChild(fragment);
//     });
// }

// // Event listeners with optimized handling
// const searchInput = document.getElementById('searchInput');
// searchInput.addEventListener('input', searchResults);
// searchInput.addEventListener('keypress', function(e) {
//     if (e.key === 'Enter') {
//         clearTimeout(searchDebounceTimer);
//         performSearch();
//     }
// });
// Precompiled regex patterns for better performance
const arabicNormalizationPatterns = {
    alefVariants: /[إأٱآ]/g,
    yehVariants: /ى/g,
    tehVariants: /ة/g,
    diacritics: /[\u064B-\u065F\u0670]/g,
    tatweel: /\u0640/g,
    abdSpace: /(عبد)\s(ال)/g
};

// Memoization cache for normalized strings
const normalizationCache = new Map();

function normalizeArabic(text) {
    if (!text) return '';
    
    // Check cache first
    const cached = normalizationCache.get(text);
    if (cached !== undefined) return cached;
    
    const normalized = text
        .toString()
        .replace(arabicNormalizationPatterns.alefVariants, 'ا')
        .replace(arabicNormalizationPatterns.yehVariants, 'ي')
        .replace(arabicNormalizationPatterns.tehVariants, 'ه')
        .replace(arabicNormalizationPatterns.diacritics, '')
        .replace(arabicNormalizationPatterns.tatweel, '')
        .replace(arabicNormalizationPatterns.abdSpace, '$1$2')
        .toLowerCase();
    
    // Cache the result
    normalizationCache.set(text, normalized);
    return normalized;
}

// Pre-processed student data with normalized names
let processedStudentsData = [];

// Load and prepare the JSON data
fetch('data/results.json')
    .then(response => response.json())
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected array');
        }
        
        // Pre-process all data at load time
        processedStudentsData = data.map(student => ({
            ...student,
            normalizedName: normalizeArabic(student.arabic_name || ''),
            normalizedSeatingNo: student.seating_no?.toString().toLowerCase() || ''
        }));
        
        console.log('Data loaded and processed successfully');
    })
    .catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('resultsContainer').innerHTML = 
            '<div class="no-results">حدث خطأ في تحميل البيانات</div>';
    });

// Debounce search to prevent rapid successive searches
let searchDebounceTimer;
const DEBOUNCE_DELAY = 300;

function searchResults() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        performSearch();
    }, DEBOUNCE_DELAY);
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('resultsContainer');
    const loading = document.getElementById('loading');
    
    if (searchTerm === '') {
        resultsContainer.innerHTML = '<div class="no-results">الرجاء إدخال اسم أو رقم جلوس للبحث</div>';
        return;
    }
    
    loading.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
        if (processedStudentsData.length === 0) {
            loading.style.display = 'none';
            resultsContainer.innerHTML = '<div class="no-results">لم يتم تحميل البيانات بعد</div>';
            return;
        }
        
        const normalizedSearchTerm = searchTerm.toLowerCase();
        
        // Search by both name and seating number
        const results = processedStudentsData.filter(student => {
            // Check if search term matches seating number (exact or partial)
            if (student.normalizedSeatingNo.includes(normalizedSearchTerm)) {
                return true;
            }
            
            // Check if search term matches name
            if (student.normalizedName.includes(normalizeArabic(searchTerm))) {
                return true;
            }
            
            return false;
        });
        
        loading.style.display = 'none';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة للبحث</div>';
            return;
        }
        
        // Use document fragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        
        results.slice(0, 100).forEach(student => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <h3>${student.arabic_name || 'غير معروف'}</h3>
                <p>رقم الجلوس: ${student.seating_no || 'غير متوفر'}</p>
                <p>النتيجة: ${student.total_degree || 'غير متوفر'}</p>
            `;
            fragment.appendChild(div);
        });
        
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(fragment);
    });
}

// Event listeners with optimized handling
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', searchResults);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        clearTimeout(searchDebounceTimer);
        performSearch();
    }
});

// Make performSearch available globally
window.performSearch = performSearch;