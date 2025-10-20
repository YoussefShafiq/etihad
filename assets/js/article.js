// تهيئة سلايدر الصور داخل المقال
function initArticleImageSlider() {
    const sliderElement = document.getElementById('article-images-slider');
    if (sliderElement) {
        console.log('🖼️ تهيئة سلايدر صور المقال...');
        return initSlider(sliderElement, {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            autoplay: {
                enabled: true,
                delay: 5000,
            },
            pagination: {
                enabled: true
            },
            navigation: {
                enabled: true
            }
        });
    }
    return null;
}

// تهيئة سلايدر الشخصيات المهمة
function initFiguresSlider() {
    const sliderElement = document.getElementById('figures-slider');
    if (sliderElement) {
        console.log('👤 تهيئة سلايدر الشخصيات...');
        return initSlider(sliderElement, {
            slidesPerView: 2,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                enabled: true,
                delay: 4000,
            },
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 20
                }
            },
            pagination: {
                enabled: true
            },
            navigation: {
                enabled: true
            }
        });
    }
    return null;
}

// إدارة الإعجابات والتعليقات
function setupArticleInteractions() {
    // زر الإعجاب
    const likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function () {
            const likeCount = this.querySelector('span');
            let count = parseInt(likeCount.textContent);

            if (this.classList.contains('liked')) {
                count--;
                this.classList.remove('liked');
            } else {
                count++;
                this.classList.add('liked');
            }

            likeCount.textContent = count;
            console.log('👍 تم تحديث عدد الإعجابات:', count);
        });
    }

    // زر المشاركة
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({
                    title: document.querySelector('.article-title')?.textContent || 'مقال الاتحاد',
                    text: document.querySelector('.article-excerpt')?.textContent || '',
                    url: window.location.href
                })
                    .then(() => console.log('✅ تمت المشاركة بنجاح'))
                    .catch(error => console.log('❌ خطأ في المشاركة:', error));
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        alert('📋 تم نسخ رابط المقال إلى الحافظة');
                    })
                    .catch(err => {
                        console.error('❌ فشل في نسخ الرابط: ', err);
                    });
            }
        });
    }

    // نموذج التعليقات
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const textarea = this.querySelector('textarea');
            const comment = textarea.value.trim();

            if (comment) {
                addComment(comment);
                textarea.value = '';
            }
        });
    }
}

// إضافة تعليق جديد
function addComment(commentText) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;

    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>مستخدم</strong>
            <span>الآن</span>
        </div>
        <div class="comment-content">
            ${commentText}
        </div>
    `;

    commentsList.appendChild(commentElement);

    // تحديث عدد التعليقات
    const commentBtn = document.querySelector('.comment-btn span');
    if (commentBtn) {
        const currentCount = parseInt(commentBtn.textContent) || 45;
        commentBtn.textContent = `${currentCount + 1} تعليق`;
    }

    console.log('💬 تم إضافة تعليق جديد');
}

// تحميل التعليقات (محاكاة)
function loadComments() {
    const comments = [
        { user: "أحمد محمد", time: "منذ ساعة", text: "مقال رائع ومعلومات قيمة، شكرًا للكاتب على هذا التحليل الدقيق." },
        { user: "فاطمة علي", time: "منذ ساعتين", text: "أتمنى أن تصل هذه المعلومات للقائمين على صنع القرار." },
        { user: "خالد السعدي", time: "منذ 3 ساعات", text: "تحليل عميق للأزمة، ننتظر المزيد من التغطيات المشابهة." }
    ];

    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <strong>${comment.user}</strong>
                <span>${comment.time}</span>
            </div>
            <div class="comment-content">
                ${comment.text}
            </div>
        `;
        commentsList.appendChild(commentElement);
    });

    console.log('📥 تم تحميل التعليقات');
}

// تتبع وقت القراءة
function setupReadingTimeTracker() {
    const articleContent = document.querySelector('.article-content');
    if (!articleContent) return;

    const words = articleContent.textContent.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    const readingTimeElement = document.createElement('div');
    readingTimeElement.className = 'reading-time';
    readingTimeElement.innerHTML = `<span>⏱️ وقت القراءة المتوقع: ${readingTime} دقيقة</span>`;

    const articleMeta = document.querySelector('.article-meta');
    if (articleMeta) {
        articleMeta.appendChild(readingTimeElement);
    }

    console.log('⏰ وقت القراءة:', readingTime, 'دقيقة');
}

// التحقق من ظهور الإعلانات
function checkAdsVisibility() {
    const ads = document.querySelectorAll('.ad-space');

    ads.forEach((ad, index) => {
        const rect = ad.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );

        console.log(`📢 الإعلان ${index + 1}:`, isVisible ? '🟢 مرئي' : '🔴 مخفي', rect);
    });
}

// تهيئة جميع المكونات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 بدء تهيئة صفحة المقال...');

    // تهيئة السلايدرات
    const imageSlider = initArticleImageSlider();
    const figuresSlider = initFiguresSlider();

    // إعداد التفاعلات
    setupArticleInteractions();

    // تحميل التعليقات
    loadComments();

    // تتبع وقت القراءة
    setupReadingTimeTracker();

    // التحقق من الإعلانات
    checkAdsVisibility();

    // إضافة تأثيرات للصور
    const images = document.querySelectorAll('.article-content img');
    images.forEach(img => {
        img.addEventListener('click', function () {
            this.classList.toggle('zoomed');
        });
    });

    console.log('✅ تم تهيئة صفحة المقال بنجاح', {
        imageSlider: !!imageSlider,
        figuresSlider: !!figuresSlider
    });

    // إعادة التحقق بعد تحميل الصفحة بالكامل
    window.addEventListener('load', function () {
        setTimeout(() => {
            checkAdsVisibility();
            console.log('🔄 إعادة التحقق بعد التحميل الكامل');
        }, 1000);
    });
});

// إضافة تنسيقات CSS ديناميكية
const style = document.createElement('style');
style.textContent = `
    .debug-border {
        border: 2px solid red !important;
    }
`;
document.head.appendChild(style);