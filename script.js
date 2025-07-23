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

// Check if we have cached data
function checkCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            return data;
        }
    } catch (e) {
        console.error('Cache parse error', e);
    }
    return null;
}

// Save data to cache
function saveToCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Failed to save cache', e);
        // If localStorage is full, clear old cache
        localStorage.removeItem(CACHE_KEY);
    }
}

// Load data with cache-first strategy
async function loadData() {
    showLoading(true);
    
    // Try cache first
    const cachedData = checkCache();
    if (cachedData) {
        processedStudentsData = cachedData;
        console.log('Loaded from cache');
        showLoading(false);
        return;
    }
    
    // Fetch fresh data
    try {
        const response = await fetch('data/results.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        
        // Process and cache
        processedStudentsData = data.map(student => ({
            ...student,
            normalizedName: normalizeArabic(student.arabic_name || ''),
            normalizedSeatingNo: student.seating_no?.toString().toLowerCase() || ''
        }));
        
        saveToCache(processedStudentsData);
        console.log('Loaded from network and cached');
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('resultsContainer').innerHTML = 
            '<div class="no-results">حدث خطأ في تحميل البيانات</div>';
    } finally {
        showLoading(false);
    }
}

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
window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const splash = document.getElementById('splashScreen');
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 500);
            }, 1500); // Minimum show time
        });

// Make performSearch available globally
window.performSearch = performSearch;
