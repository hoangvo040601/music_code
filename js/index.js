const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const database = 'http://localhost:3000/songs';
const playList = $('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const play = $('.btn-toggle-play');
const player = $('.player')
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevSong = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeat = $('.btn-repeat');
const PLAYER_STORAGE_KEY = 'MYMUSIC_PLAYER';
let currentSong = 0;
let isPlaying;
let isRandom = false;
let isRepeat = false;
// const app = {
//     config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
//     setconfig : function(key,value){
//         this.config[key]=value;
//         localStorage.setItem(PLAYER_STORAGE_KEY, this.config);
//     }
// }


// hàm cha.
function App(){
    getData(renderData);
    handlEvent();
    getData(loadingSongs);
    handleEventPlay(); 
    getData(nextSong);
    getData(randomSong);
    scrollTopSong();
    getData(songActive);
};
App();

// Thao tác lấy dữ liệu từ fake API
function getData(callback){
    fetch(database)
    .then(function(response){
        return response.json();
    })
    .then(callback)
}
// Hàm lấy dữ liệu đổ ra Doc.
function renderData(songs){
    const htmls = songs.map(function(element,index){
        return `
        <div class="song ${index === currentSong ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${element.image}')">
        </div>
            <div class="body">
                <h3 class="title">${element.name}</h3>
                <p class="author">${element.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `
    })
    playList.innerHTML=htmls.join('');
}
// Hàm thay đổi giao diện khi lướt bài.
function handlEvent(){
    // xử lý phóng to thu nhỏ list bài hát.
    const cdWidth = cd.offsetWidth;
    document.onscroll = function(){
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - scrollTop;
        cd.style.width =newCdWidth > 0 ? newCdWidth + 'px':0;
        cd.style.opacity = newCdWidth / cdWidth ;
    }
}

// Hàm tải bải hát.
function loadingSongs(Songs){
    heading.textContent = Songs[currentSong].name;
    cdThumb.style.backgroundImage = `url('${Songs[currentSong].image}')`;
    audio.src = Songs[currentSong].path;
}
// Hàm xử lý qua bài hát kiểu tiến.
function nextSong(Songs){
        currentSong++;
        if(currentSong >= Songs.length){
            currentSong=0;
        }
        loadingSongs(Songs);
        audio.play();
}
// Hàm xử lý qua bài hát kiểu lùi.
function prevsong(Songs){
    currentSong--;
    if(currentSong < 0){
        currentSong= Songs.length-1;
    }
    loadingSongs(Songs);
    audio.play();
}
//Hmaf xử lý random.
function randomSong(Songs){
    let newIndex;
    do{
        newIndex = Math.floor(Math.random()*Songs.length)
    } while(newIndex == currentSong)
    currentSong = newIndex;
    loadingSongs(Songs);
    audio.play();
    getData(renderData);
    scrollTopSong();
}

// đẩy bài hát lên topscroll
function scrollTopSong(){
    setTimeout(()=>{
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block:'nearest'
        })
    },300)
}
function songActive(Songs){
    getData(renderData);
    loadingSongs(Songs);
    audio.play();
}

// hàm xuwr lý tác vụ.
function handleEventPlay(Songs){
    play.onclick = function(){
        if(isPlaying){
            audio.pause();
        }
        else{
            audio.play();
        }
    }
// Play bài hát.
    audio.onplay = function(){
        isPlaying = true;
        player.classList.add('playing');
        cdThumbAnimate.play();
    }
// Dừng bài hát
    audio.onpause = function(){
        isPlaying = false;
        player.classList.remove('playing');
        cdThumbAnimate.pause();
    }
// làm chuyển động thanh thời gian.
    audio.ontimeupdate = function(){
        if(audio.duration){
            const currentProgress = Math.floor(audio.currentTime / audio.duration *100);
            progress.value = currentProgress;
        }
    }
// tuỳ chỉnh thời gian của bài hát.
    progress.onchange = function(e){
        const currentTimesong = e.target.value * audio.duration /100;
        audio.currentTime = currentTimesong;
    }
// Sang bài hát mới kiểu tiến.
    nextBtn.onclick = function(){
        if(isRandom){
            getData(randomSong);
        } else{
            getData(nextSong);
            getData(renderData);
            scrollTopSong();
            // audio.play();
        }
    }
// Sang bài hát mới kểu lùi
    prevSong.onclick = function(){
        if(isRandom){
            getData(randomSong);
        } else{
            getData(prevsong);
            getData(renderData);
            scrollTopSong();
            // audio.play();
        }
    }
    
// Tạo chuyển động xoay tròn bài hát.
    const cdThumbAnimate = cdThumb.animate([
        {
            transform: 'rotate(360deg)'
        }],{
            duration:10000,
            iterations: Infinity //lawpj voo hanj
    })
    cdThumbAnimate.pause();

// random bài hát.
    randomBtn.onclick = function(){
            isRandom = !isRandom;
            // app.setconfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active',isRandom);
    }

// Xử lý bài hát để qua bài mới khi bài hát này kết thúc.

    audio.onended = function(){
        if(isRepeat){
            audio.play();
        }else{
            nextBtn.click()
        }
        loadingSongs(Songs);
    }
// repeat bai hat
    repeat.onclick = function(){
        isRepeat = !isRepeat;
        // app.setconfig('isRepeat', app.isRepeat);
            repeat.classList.toggle('active',isRepeat);
    }

// active bai hat
    playList.onclick = function(e){
        const songNode = e.target.closest('.song:not(.active)');
        currentSong = Number(songNode.dataset.index);
        if( songNode || e.target.closest('.option'))
        {
            if(songNode){
                getData(songActive);
                audio.play();
            }
            // if(e.target.closest('.option')){

            // }
        }
    }
}

