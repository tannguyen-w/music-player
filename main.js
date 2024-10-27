const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Không Phải Dạng Vừa Đâu",
            singer: "Sơn Tùng",
            path: "./assets/music/KhongPhaiDangVuaDau-SonTungMTP-3753840.mp3",
            image: "./assets/image/khongPhaiDangVuaDau.jpg",
        },
        {
            name: "Có Chắc Yêu Là Đây",
            singer: "Sơn Tùng",
            path: "./assets/music/COCHACYEULADAY-SonTungMTP-6316913.mp3",
            image: "./assets/image/coChacYeuLaDay.jpg",
        },
        {
            name: "Muộn Rồi Mà Sao Còn",
            singer: "Sơn Tùng",
            path: "./assets/music/MuonRoiMaSaoCon-SonTungMTP-7011803.mp3",
            image: "./assets/image/muonRoiMaSaoCon.jpg",
        },
        {
            name: "Chúng Ta Của Hiện Tại",
            singer: "Sơn Tùng",
            path: "./assets/music/ChungTaCuaHienTai-SonTungMTP-6892340.mp3",
            image: "./assets/image/chungTaCuaHienTai.jpg",
        },
        {
            name: "Lạc Trôi",
            singer: "Sơn Tùng",
            path: "./assets/music/LacTroi-SonTungMTP-4725907.mp3",
            image: "./assets/image/lacTroi.jpg",
        },
        {
            name: "Hãy Trao Cho Anh",
            singer: "Sơn Tùng",
            path: "./assets/music/HayTraoChoAnh-SonTungMTPSnoopDogg-6010660.mp3",
            image: "./assets/image/hayTraoChoAnh.jpg",
        },
        {
            name: "Em Của Ngày Hôm Qua",
            singer: "Sơn Tùng",
            path: "./assets/music/EmCuaNgayHomQua-SonTungMTP-2882720.mp3",
            image: "./assets/image/emCuaNgayHomQua.jpg",
        },
        {
            name: "Nơi Này Có Anh",
            singer: "Sơn Tùng",
            path: "./assets/music/NoiNayCoAnh-SonTungMTP-4772041.mp3",
            image: "./assets/image/noiNayCoAnh.jpg",
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div
                        class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });

        playlist.innerHTML = htmls.join("");
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xu ly CD quay va dung theo pause, play
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000,
            iterations: Infinity,
        });

        cdThumbAnimate.pause();

        // Xu ly phong to, thu nho CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xy ly khi click Play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song duoc play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // Khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        };

        // Xu ly khi tua bai hat
        progress.onchange = function (e) {
            const seekTime = (e.target.value * audio.duration) / 100;
            audio.currentTime = seekTime;
        };

        // Khi next bai hat
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Khi prev bai hat
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Khi random bai hat
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Khi repeat bai hat
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // Xu ly next song khi song chay het
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lang nghe click vao playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode || e.target.closest(".option")) {
                console.log(e.target);

                // Xu ly khi click vao song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // Xu ly khi click vao song option
            }
        };
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    prevSong: function () {
        this.currentIndex--;

        if (this.currentIndex <= 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    nextSong: function () {
        this.currentIndex++;

        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    randomSong: function () {
        let random;
        do {
            random = Math.round(Math.random() * this.songs.length);
        } while (this.currentIndex == random);

        if (this.currentIndex > this.songs.length) {
            this.currentIndex = this.songs.length;
        } else {
            this.currentIndex = random;
        }

        console.log(random);

        this.loadCurrentSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 200);
    },

    start: function () {
        // Gan cau hinh, tu config vao ung dung
        this.loadConfig();
        // Dinh nghia cac thuoc tinh cho Object
        this.defineProperties();

        // Lang nghe, xu ly cac su kien (DOM events)
        this.handleEvents();

        // Tai thong tin bai hat hien tai vao UI khi chay dau tien
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hien thi trang thai ban dau cua Btn repeat va random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
