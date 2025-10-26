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

// بيانات التعليقات
const allComments = [
    { user: "أحمد محمد", time: "منذ ساعة", text: "مقال رائع ومعلومات قيمة، شكرًا للكاتب على هذا التحليل الدقيق." },
    { user: "فاطمة علي", time: "منذ ساعتين", text: "أتمنى أن تصل هذه المعلومات للقائمين على صنع القرار." },
    { user: "خالد السعدي", time: "منذ 3 ساعات", text: "تحليل عميق للأزمة، ننتظر المزيد من التغطيات المشابهة." },
    { user: "سارة أحمد", time: "منذ 4 ساعات", text: "موضوع مهم جدًا، شكرًا على الطرح الموضوعي." },
    { user: "محمد حسن", time: "منذ 5 ساعات", text: "مقال شامل ومفيد، استفدت كثيرًا من المعلومات المقدمة." },
    { user: "نور الدين", time: "منذ 6 ساعات", text: "أتمنى رؤية المزيد من هذه التحليلات المعمقة." }
];

// إنشاء عنصر تعليق
function createCommentElement(comment) {
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
    return commentElement;
}

// تحميل التعليقات المعاينة (أول تعليقين فقط)
function loadPreviewComments() {
    const commentsList = document.querySelector('.comments-section .comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = '';
    const previewComments = allComments.slice(0, 2);

    previewComments.forEach(comment => {
        commentsList.appendChild(createCommentElement(comment));
    });

    console.log('📥 تم تحميل معاينة التعليقات');
}

// تحميل جميع التعليقات في الـ popup
function loadAllComments() {
    const allCommentsList = document.querySelector('.all-comments-list');
    if (!allCommentsList) return;

    allCommentsList.innerHTML = '';

    allComments.forEach(comment => {
        allCommentsList.appendChild(createCommentElement(comment));
    });

    console.log('📥 تم تحميل جميع التعليقات');
}

// فتح popup مع animation
function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('closing');
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// إغلاق popup مع animation
function closePopup(popup) {
    popup.classList.add('closing');

    setTimeout(() => {
        popup.classList.remove('active', 'closing');
        document.body.style.overflow = '';
    }, 300); // مدة الـ animation
}

// عرض رسالة نجاح مخصصة
function showSuccessMessage(message) {
    // إنشاء عنصر الرسالة
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--highlight);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 99999;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.4s ease;
        font-weight: bold;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // عرض الرسالة
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // إخفاء الرسالة
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// التعامل مع الأزرار والـ popups
function initCommentsSystem() {
    // زر عرض جميع التعليقات
    const btnViewAll = document.querySelector('.btn-view-all');
    if (btnViewAll) {
        btnViewAll.addEventListener('click', () => {
            loadAllComments();
            openPopup('allCommentsPopup');
        });
    }

    // زر إضافة تعليق
    const btnAddComment = document.querySelector('.btn-add-comment');
    if (btnAddComment) {
        btnAddComment.addEventListener('click', () => {
            openPopup('addCommentPopup');
        });
    }

    // أزرار إغلاق الـ popups
    const closeButtons = document.querySelectorAll('.close-popup');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const popup = btn.closest('.comments-popup');
            closePopup(popup);
        });
    });

    // إغلاق عند الضغط على الـ overlay
    const overlays = document.querySelectorAll('.popup-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            const popup = overlay.closest('.comments-popup');
            closePopup(popup);
        });
    });

    // إغلاق عند الضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activePopup = document.querySelector('.comments-popup.active');
            if (activePopup) {
                closePopup(activePopup);
            }
        }
    });

    // التعامل مع نموذج إضافة تعليق
    const commentForm = document.querySelector('#addCommentPopup .comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = commentForm.querySelector('.comment-name');
            const textArea = commentForm.querySelector('.comment-text');

            const newComment = {
                user: nameInput.value,
                time: "الآن",
                text: textArea.value
            };

            // إضافة التعليق للقائمة
            allComments.unshift(newComment);

            // تحديث العدد
            const commentCount = document.querySelector('.comments-section h3');
            const allCommentsCount = document.querySelector('#allCommentsPopup h3');
            if (commentCount) {
                commentCount.textContent = `التعليقات (${allComments.length})`;
            }
            if (allCommentsCount) {
                allCommentsCount.textContent = `جميع التعليقات (${allComments.length})`;
            }

            // إعادة تحميل المعاينة
            loadPreviewComments();

            // إعادة تعيين النموذج
            nameInput.value = '';
            textArea.value = '';

            // إغلاق الـ popup
            const popup = commentForm.closest('.comments-popup');
            closePopup(popup);

            // إظهار رسالة نجاح
            showSuccessMessage('✅ تم إضافة تعليقك بنجاح!');

            console.log('✅ تم إضافة تعليق جديد');
        });
    }

    // تحميل المعاينة عند البداية
    loadPreviewComments();
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initCommentsSystem);
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
function generateTableOfContents() {
    const articleContent = document.querySelector('.article-content .content');
    const tocSections = document.querySelectorAll('.table-of-contents');
    const tocLists = document.querySelectorAll('.toc-list');

    if (!articleContent || tocSections.length === 0) return false;

    const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

    if (headings.length === 0) {
        // Hide all TOC sections if no headings
        tocSections.forEach(section => {
            section.style.display = 'none';
        });
        return false;
    }

    // Show all TOC sections
    tocSections.forEach(section => {
        section.style.display = 'block';
    });

    const tocLinksMap = new Map();

    // Generate TOC for each list
    tocLists.forEach(tocList => {
        // Clear existing content
        tocList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        headings.forEach((heading, index) => {
            let headingId = heading.id || `section-${index + 1}`;
            if (!heading.id) heading.id = headingId;

            const headingLevel = parseInt(heading.tagName.substring(1));

            const tocItem = document.createElement('li');
            tocItem.className = 'toc-item';

            const tocLink = document.createElement('a');
            tocLink.href = `#${headingId}`;
            tocLink.className = 'toc-link';
            tocLink.innerHTML = `<span class="toc-title" style="padding-right: ${(headingLevel - 1) * 20}px">${heading.textContent}</span>`;

            tocItem.appendChild(tocLink);
            fragment.appendChild(tocItem);

            // Store mapping for this specific TOC list
            const listId = tocList.closest('.table-of-contents').className;
            tocLinksMap.set(`${headingId}-${listId}`, tocLink);

            tocLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(headingId)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, `#${headingId}`);
            });
        });

        tocList.appendChild(fragment);
    });

    setupSimpleScrollSpy(headings, tocLinksMap);
    return true;
}

function setupSimpleScrollSpy(headings, tocLinksMap) {
    let currentActive = null;

    function updateActiveHeading() {
        const scrollY = window.scrollY + window.innerHeight * 0.1; // 10% from top

        let current = null;

        // Find the heading that's closest to the top
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            if (heading.offsetTop <= scrollY) {
                current = heading;
                break;
            }
        }

        // If no heading found and we're at top, use first heading
        if (!current && scrollY < 100 && headings.length > 0) {
            current = headings[0];
        }

        if (current && current.id !== currentActive) {
            // Remove active from all TOC links
            tocLinksMap.forEach(link => link.classList.remove('active'));

            // Add active to current in all TOCs
            tocLinksMap.forEach((link, key) => {
                if (key.startsWith(current.id)) {
                    link.classList.add('active');
                }
            });

            currentActive = current.id;
        }
    }

    function throttle(func, limit) {
        let inThrottle;
        return function () {
            if (!inThrottle) {
                func();
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    const throttledUpdate = throttle(updateActiveHeading, 100);

    // Initial call
    updateActiveHeading();

    // Event listeners
    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('resize', throttledUpdate);

    // Update on load complete
    window.addEventListener('load', updateActiveHeading);
}

// بيانات الأسئلة الشائعة
const faqData = [
    {
        question: "ما هي أهداف الموقع الرئيسية؟",
        answer: "نهدف إلى تقديم محتوى إخباري دقيق وموثوق يغطي مختلف المجالات السياسية والاقتصادية والاجتماعية. نسعى لتوفير منصة شاملة تجمع بين التحليل العميق والتغطية السريعة للأحداث الجارية."
    },
    {
        question: "كيف يمكنني التواصل مع فريق التحرير؟",
        answer: "يمكنك التواصل معنا عبر عدة طرق:<ul><li>البريد الإلكتروني: editor@example.com</li><li>نموذج الاتصال في الموقع</li><li>حساباتنا على وسائل التواصل الاجتماعي</li><li>رقم الهاتف: +20 123 456 7890</li></ul>"
    },
    {
        question: "هل المحتوى المنشور محمي بحقوق النشر؟",
        answer: "نعم، جميع المواد المنشورة على الموقع محمية بحقوق النشر. يمكن الاقتباس منها مع ذكر المصدر، لكن النسخ الكامل أو إعادة النشر دون إذن يعد انتهاكاً لحقوق الملكية الفكرية."
    }
];

// إنشاء عنصر سؤال
function createFaqElement(faq, index) {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    faqItem.innerHTML = `
        <div class="faq-question">
            <h3>${faq.question}</h3>
            <span class="faq-icon">▼</span>
        </div>
        <div class="faq-answer">
            <p>${faq.answer}</p>
        </div>
    `;
    return faqItem;
}

// تحميل الأسئلة الشائعة
function loadFAQ() {
    const faqList = document.querySelector('.faq-list');
    if (!faqList) return;

    faqList.innerHTML = '';

    faqData.forEach((faq, index) => {
        faqList.appendChild(createFaqElement(faq, index));
    });

    console.log('❓ تم تحميل الأسئلة الشائعة');
}

// التعامل مع نقرات الأسئلة (Accordion)
function initFaqAccordion() {
    const faqList = document.querySelector('.faq-list');
    if (!faqList) return;

    faqList.addEventListener('click', (e) => {
        const questionElement = e.target.closest('.faq-question');
        if (!questionElement) return;

        const faqItem = questionElement.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        // إغلاق جميع الأسئلة المفتوحة
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // تبديل حالة السؤال الحالي
        faqItem.classList.toggle('active');

        console.log(`${isActive ? '📕' : '📖'} ${isActive ? 'إغلاق' : 'فتح'} سؤال`);
    });
}


// تهيئة نظام الأسئلة الشائعة
function initFaqSystem() {
    loadFAQ();
    initFaqAccordion();
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initFaqSystem();
    setTimeout(generateTableOfContents, 100); // Small delay to ensure DOM is ready

});

document.getElementById('ai-summarize-toggle').addEventListener('click', function () {
    document.getElementById('ai-summarize').classList.toggle('closed');
});

