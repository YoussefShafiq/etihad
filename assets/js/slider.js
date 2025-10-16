class CustomSlider {
    constructor(el, opts = {}) {
        this.el = el;
        this.track = el.querySelector('.slider-track');
        this.slides = el.querySelectorAll('.slide');
        this.prevBtn = el.querySelector('.slider-button-prev');
        this.nextBtn = el.querySelector('.slider-button-next');
        this.pagination = el.querySelector('.slider-pagination');
        this.scrollbarDrag = el.querySelector('.scrollbar-drag');

        this.currentIndex = 0;
        this.slideCount = this.slides.length;

        // Options
        this.opts = {
            loop: opts.loop !== undefined ? opts.loop : true,
            autoplay: opts.autoplay !== undefined ? opts.autoplay : true,
            autoplayDelay: opts.autoplayDelay || 3000,
            speed: opts.speed || 500,
            keyboard: opts.keyboard !== undefined ? opts.keyboard : true,
            mousewheel: opts.mousewheel !== undefined ? opts.mousewheel : false,
            slidesPerView: {
                mobile: opts.slidesPerView?.mobile || 1,
                tablet: opts.slidesPerView?.tablet || 2,
                desktop: opts.slidesPerView?.desktop || 3
            },
            breakpoints: {
                mobile: opts.breakpoints?.mobile || 640,
                tablet: opts.breakpoints?.tablet || 1024
            },
            spaceBetween: opts.spaceBetween || 20,
            ...opts
        };

        // Touch/drag
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;

        // Current slides per view
        this.currentSlidesPerView = this.getSlidesPerView();

        this.init();
    }

    init() {
        this.setSlideWidths();
        this.setTrackGap();
        this.createPagination();
        this.updateScrollbar();
        this.attachEvents();
        this.updateButtons();

        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    getSlidesPerView() {
        const width = window.innerWidth;
        if (width < this.opts.breakpoints.mobile) {
            return this.opts.slidesPerView.mobile;
        } else if (width < this.opts.breakpoints.tablet) {
            return this.opts.slidesPerView.tablet;
        } else {
            return this.opts.slidesPerView.desktop;
        }
    }

    setSlideWidths() {
        this.currentSlidesPerView = this.getSlidesPerView();
        const containerWidth = this.el.querySelector('.slider-wrapper').offsetWidth;
        const totalGap = this.opts.spaceBetween * (this.currentSlidesPerView - 1);
        const slideWidth = (containerWidth - totalGap) / this.currentSlidesPerView;

        this.slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
    }

    setTrackGap() {
        this.track.style.gap = `${this.opts.spaceBetween}px`;
    }

    getTotalPages() {
        return Math.ceil(this.slideCount / this.currentSlidesPerView);
    }

    createPagination() {
        this.pagination.innerHTML = '';
        const totalPages = this.getTotalPages();

        for (let i = 0; i < totalPages; i++) {
            const bullet = document.createElement('button');
            bullet.classList.add('pagination-bullet');
            if (i === 0) bullet.classList.add('active');
            bullet.addEventListener('click', () => this.goToPage(i));
            this.pagination.appendChild(bullet);
        }
        this.bullets = this.pagination.querySelectorAll('.pagination-bullet');
    }

    attachEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        // Touch events
        this.track.addEventListener('touchstart', this.touchStart.bind(this), { passive: true });
        this.track.addEventListener('touchmove', this.touchMove.bind(this), { passive: true });
        this.track.addEventListener('touchend', this.touchEnd.bind(this));

        // Mouse events
        this.track.addEventListener('mousedown', this.touchStart.bind(this));
        this.track.addEventListener('mousemove', this.touchMove.bind(this));
        this.track.addEventListener('mouseup', this.touchEnd.bind(this));
        this.track.addEventListener('mouseleave', this.touchEnd.bind(this));

        // Prevent context menu
        this.track.addEventListener('contextmenu', e => e.preventDefault());

        // Keyboard
        if (this.opts.keyboard) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });
        }

        // Mousewheel
        if (this.opts.mousewheel) {
            this.el.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.deltaY > 0) this.next();
                else this.prev();
            }, { passive: false });
        }

        // Resize
        window.addEventListener('resize', () => {
            this.setSlideWidths();
            this.updateSlider();

            // Recreate pagination if slides per view changed
            const newSlidesPerView = this.getSlidesPerView();
            if (newSlidesPerView !== this.currentSlidesPerView) {
                this.currentSlidesPerView = newSlidesPerView;
                // Adjust current index to prevent out of bounds
                const maxIndex = this.getMaxIndex();
                if (this.currentIndex > maxIndex) {
                    this.currentIndex = maxIndex;
                }
                this.createPagination();
                this.updateSlider();
            }
        });
    }

    touchStart(e) {
        this.isDragging = true;
        this.startPos = this.getPositionX(e);
        this.animationID = requestAnimationFrame(this.animation.bind(this));
        this.track.classList.add('dragging');
        this.stopAutoplay();
    }

    touchMove(e) {
        if (this.isDragging) {
            const currentPosition = this.getPositionX(e);
            this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
        }
    }

    touchEnd() {
        this.isDragging = false;
        cancelAnimationFrame(this.animationID);
        this.track.classList.remove('dragging');

        const movedBy = this.currentTranslate - this.prevTranslate;
        const slideWidth = this.slides[0].offsetWidth + this.opts.spaceBetween;
        const threshold = slideWidth / 3;

        if (movedBy < -threshold && this.currentIndex < this.getMaxIndex()) {
            this.currentIndex += 1;
        } else if (movedBy > threshold && this.currentIndex > 0) {
            this.currentIndex -= 1;
        } else if (this.opts.loop) {
            if (movedBy < -threshold && this.currentIndex === this.getMaxIndex()) {
                this.currentIndex = 0;
            } else if (movedBy > threshold && this.currentIndex === 0) {
                this.currentIndex = this.getMaxIndex();
            }
        }

        this.updateSlider();

        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    animation() {
        if (this.isDragging) {
            this.setSliderPosition();
            requestAnimationFrame(this.animation.bind(this));
        }
    }

    setSliderPosition() {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    getMaxIndex() {
        return Math.max(0, this.slideCount - this.currentSlidesPerView);
    }

    updateSlider() {
        const slideWidth = this.slides[0].offsetWidth + this.opts.spaceBetween;
        this.currentTranslate = this.currentIndex * -slideWidth;
        this.prevTranslate = this.currentTranslate;
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;

        this.updatePagination();
        this.updateButtons();
        this.updateScrollbar();
    }

    updatePagination() {
        const currentPage = Math.floor(this.currentIndex / this.currentSlidesPerView);
        this.bullets.forEach((bullet, idx) => {
            bullet.classList.toggle('active', idx === currentPage);
        });
    }

    updateButtons() {
        if (!this.opts.loop) {
            this.prevBtn.classList.toggle('disabled', this.currentIndex === 0);
            this.nextBtn.classList.toggle('disabled', this.currentIndex === this.getMaxIndex());
        }
    }

    updateScrollbar() {
        const maxIndex = this.getMaxIndex();
        const progress = maxIndex > 0 ? (this.currentIndex / maxIndex) * 100 : 0;
        const totalPages = this.getTotalPages();
        const width = (1 / totalPages) * 100;
        this.scrollbarDrag.style.width = width + '%';
        this.scrollbarDrag.style.transform = `translateX(${progress}%)`;
    }

    goToPage(pageIndex) {
        this.stopAutoplay();
        this.currentIndex = pageIndex * this.currentSlidesPerView;
        // Ensure we don't go past the last slide
        this.currentIndex = Math.min(this.currentIndex, this.getMaxIndex());
        this.updateSlider();
        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    goToSlide(idx) {
        this.stopAutoplay();
        this.currentIndex = idx;
        this.updateSlider();
        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    next() {
        this.stopAutoplay();
        const maxIndex = this.getMaxIndex();
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
        } else if (this.opts.loop) {
            this.currentIndex = 0;
        }
        this.updateSlider();
        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    prev() {
        this.stopAutoplay();
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else if (this.opts.loop) {
            this.currentIndex = this.getMaxIndex();
        }
        this.updateSlider();
        if (this.opts.autoplay) {
            this.startAutoplay();
        }
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.opts.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

// Initialize slider
const slider = new CustomSlider(document.getElementById('slider'), {
    loop: true,
    autoplay: true,
    autoplayDelay: 3000,
    keyboard: true,
    mousewheel: true,
    slidesPerView: {
        mobile: 1,    // 1 slide on mobile
        tablet: 2,    // 2 slides on tablet
        desktop: 5    // 3 slides on desktop
    },
    breakpoints: {
        mobile: 640,   // Mobile breakpoint (px)
        tablet: 1024   // Tablet breakpoint (px)
    },
    spaceBetween: 20   // Gap between slides (px)
});