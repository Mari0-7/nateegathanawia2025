// script.js - Modified version

const arabicNormalizationPatterns = {
    alefVariants: /[إأٱآ]/g,
    yehVariants: /ى/g,
    tehVariants: /ة/g,
    diacritics: /[\u064B-\u065F\u0670]/g,
    tatweel: /\u0640/g,
    abdSpace: /(عبد)\s(ال)/g
};

const normalizationCache = new Map();
const CACHE_KEY = 'examResults2025';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function normalizeArabic(text) {
    if (!text) return '';
    
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
    
    normalizationCache.set(text, normalized);
    return normalized;
}

let processedStudentsData = [];

function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('hidden');
        // Remove from DOM after animation completes
        setTimeout(() => splash.remove(), 500);
    }
}

// Minimum splash screen display time (1.5 seconds)
const MIN_SPLASH_TIME = 1500;
const loadStartTime = Date.now();

// Load data with splash screen
fetch('data/results.json')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected array');
        }
        
        processedStudentsData = data.map(student => ({
            ...student,
            normalizedName: normalizeArabic(student.arabic_name || ''),
            normalizedSeatingNo: student.seating_no?.toString().toLowerCase() || ''
        }));
        
        console.log('Data loaded and processed successfully');
        
        // Calculate remaining time to meet minimum splash duration
        const loadTime = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, MIN_SPLASH_TIME - loadTime);
        
        setTimeout(hideSplashScreen, remainingTime);
    })
    .catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('resultsContainer').innerHTML = 
            '<div class="no-results">حدث خطأ في تحميل البيانات</div>';
        
        // Hide splash immediately on error (after minimum duration)
        const loadTime = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, MIN_SPLASH_TIME - loadTime);
        setTimeout(hideSplashScreen, remainingTime);
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
function showSplashScreen(show) {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        if (show) {
            splash.style.display = 'flex';
            splash.style.opacity = '1';
        } else {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500); // Match the CSS transition time
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
            loadData();
             setTimeout(() => {
    }, 1500);
        });

// Make performSearch available globally
window.performSearch = performSearch;
