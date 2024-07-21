let songs;
let currSong=new Audio();
let currFolder;

async function getsongs(folder){
    currFolder=folder;
    let a=await fetch(`http://127.0.0.1:3000/${currFolder}`);
    let response =await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
    songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`http://127.0.0.1:3000/${currFolder}`)[1]);
        }
    }
    // console.log(songs);
    playMusic(songs[0],true);

    //show all the songs in playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML="";
    for (const songCurr of songs) {
        songUl.innerHTML=songUl.innerHTML + `
                        <li>
                        <img src="img/music.svg" class="invert" alt="">
                        <div class="info">
                            <div>${songCurr.replaceAll("%20"," ")}</div>
                            <div>Sahil</div>
                        </div>
                        <div class="playNow">
                            <span>Play Now</span>
                            <img class="invert" src="img/music-play.svg">
                        </div>
                       </li>`;  
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click",(ele)=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });        
    });

}
function convertSecondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }
    // Calculate minutes and seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Format the time as "minutes:seconds"
    var formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

    return formattedTime;
}






const playMusic=(track,pause=false)=>{
    // let audio=new Audio("songs/"+track);
    // audio.play();
    currSong.src=`${currFolder}`+track;
    // console.log(currSong.src);

    if(!pause){
        currSong.play();
        play.src="img/pause.svg";
        // console.dir(currSong);
    }    
    document.querySelector(".songInfo").innerHTML=decodeURI(track);
    document.querySelector(".songTime").innerHTML="00:00 / 00:00";
}

async function displayAlbums(){
    let a=await fetch(`http://127.0.0.1:3000/songs/`);
    let response =await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let anc=div.getElementsByTagName("a");
    let cardContainer=document.querySelector(".card-container");
    let array=Array.from(anc);
    for (let index = 0; index < array.length; index++) {
        const ele = array[index];
        if(ele.href.includes("songs/") && !ele.href.includes(".htaccess")){
            let Folder=ele.href.split("/").slice(-2)[0];
            //get metdata of the folder
            // console.log(Folder);
            let a=await fetch(`http://127.0.0.1:3000/songs/${Folder}/info.json`);
            let response =await a.json();
            // console.log(response);
            cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder="${Folder}" class="card ">
                <img src="songs/${Folder}/cover.png" alt="">
                <div class="play-icon"> <img src="img/play1.svg" alt="play icon"></div>
                <h3>${response.title}</h3>
                <p>${response.description}</p>
                </div>` ;
        }
    }
    //add event listner to select card(folder)
    //Load the playlist whenever card is called
    Array.from(document.querySelectorAll(".card")).forEach(ele => {
        ele.addEventListener("click",async (item)=>{
            await getsongs(`songs/${item.currentTarget.dataset.folder}/`);
            playMusic(songs[0]);
        })
        
    });

}


async function main(){
    // get the list of all songs
    await getsongs("songs/folder1/");
    // playMusic(songs[0],true);
    // //show all the songs in playlist
    // let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    // for (const songCurr of songs) {
    //     songUl.innerHTML=songUl.innerHTML + `
    //                     <li>
    //                     <img src="img/music.svg" class="invert" alt="">
    //                     <div class="info">
    //                         <div>${songCurr.replaceAll("%20"," ")}</div>
    //                         <div>Sahil</div>
    //                     </div>
    //                     <div class="playNow">
    //                         <span>Play Now</span>
    //                         <img class="invert" src="img/music-play.svg">
    //                     </div>
    //                    </li>`;  
    // }
    // Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e)=>{
    //     e.addEventListener("click",(ele)=>{
    //         console.log(e.querySelector(".info").firstElementChild.innerHTML);
    //         playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    //     });        
    // });


    //display all the albums on page
    displayAlbums();

    //Attch an event listner to play , next and previous
    play.addEventListener("click",()=>{
        if(currSong.paused){
            currSong.play();
            play.src="img/pause.svg";

        }else{
            play.src="img/playbar play.svg";
            currSong.pause();
        }
    });

    //Listen for timeupdate event
    currSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songTime").innerHTML=`${convertSecondsToMinutesSeconds(currSong.currentTime)} / ${convertSecondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left=(currSong.currentTime/currSong.duration)*100+'%';
    });
    //add event listner for seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent +'%';
        currSong.currentTime=(currSong.duration * percent)/100;
    });
    // add an event listner to hamburger icon
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left=0;
        document.querySelector(".close").style.display="block";
    });
    //add event listner to close icon
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left=-130+'%';
    });

    //add event listner to previous button
    previous.addEventListener("click",()=>{
        let index=songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if((index-1)>=0){
            playMusic(songs[index-1]);
            document.querySelector(".songTime").innerHTML="00:00 / 00:00";
        }
    });
    //add event listner to next button
    next.addEventListener("click",()=>{
        let index=songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if((index+1)<songs.length){
            playMusic(songs[index+1]);
            document.querySelector(".songTime").innerHTML="00:00 / 00:00";
        }
    });
    //add event listner to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currSong.volume = (e.target.value)/100;
        if(currSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
        };
    });

    //add evenet listner to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target.src);
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currSong.volume=0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=0;
        }else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currSong.volume=0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=10;
        }
    })

    
}
main();









