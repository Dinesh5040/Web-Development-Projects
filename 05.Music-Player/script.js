const $ = id => document.getElementById(id);
const audio = $('audio');
let songs = [];
let currentIndex = -1;

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return '0:00';
  const minutes=Math.floor(seconds/60);
  const remaining=Math.floor(seconds%60);
  return minutes+':'+String(remaining).padStart(2,'0');
}
function updatePlayButton(){ $('play').textContent=audio.paused?'▶':'Ⅱ'; }

function loadSong(index,autoplay=true){
  if(!songs.length)return;
  currentIndex=(index+songs.length)%songs.length;
  const song=songs[currentIndex];
  audio.src=song.url;
  $('title').textContent=song.name;
  $('artist').textContent=song.artist;
  renderPlaylist();
  if(autoplay)audio.play().then(updatePlayButton).catch(updatePlayButton);
}
function renderPlaylist(){
  $('playlist').innerHTML='';
  songs.forEach((song,index)=>{
    const row=document.createElement('div');
    row.className='song'+(index===currentIndex?' active':'');
    const number=document.createElement('span');number.className='num';number.textContent=String(index+1).padStart(2,'0');
    const meta=document.createElement('div');meta.className='songmeta';
    const name=document.createElement('b');name.textContent=song.name;
    const artist=document.createElement('small');artist.textContent=song.artist;
    meta.append(name,artist);
    const remove=document.createElement('button');remove.textContent='✕';remove.title='Remove song';
    remove.onclick=event=>{
      event.stopPropagation();
      const wasCurrent=currentIndex===index;
      URL.revokeObjectURL(songs[index].url);
      songs.splice(index,1);
      if(!songs.length){
        currentIndex=-1;audio.pause();audio.removeAttribute('src');
        $('title').textContent='Choose a song';$('artist').textContent='Add audio files from your device';
      }else if(wasCurrent){loadSong(Math.min(index,songs.length-1),false);}
      else if(index<currentIndex)currentIndex--;
      renderPlaylist();
    };
    row.append(number,meta,remove);
    row.addEventListener('click',()=>loadSong(index));
    $('playlist').append(row);
  });
  if(!songs.length)$('playlist').innerHTML='<div class="song"><span class="num">♪</span><div class="songmeta"><b>Your playlist is empty</b><small>Choose audio files to begin</small></div></div>';
}

$('files').addEventListener('change',event=>{
  [...event.target.files].forEach(file=>{
    songs.push({name:file.name.replace(/\.[^.]+$/,''),artist:'From your device',url:URL.createObjectURL(file)});
  });
  if(currentIndex<0&&songs.length)loadSong(0,false);else renderPlaylist();
  event.target.value='';
});
$('play').addEventListener('click',()=>{
  if(currentIndex<0){if(songs.length)loadSong(0);else $('files').click();return;}
  if(audio.paused)audio.play();else audio.pause();
  updatePlayButton();
});
$('prev').addEventListener('click',()=>{
  if(!songs.length)return;
  if(audio.currentTime>3)audio.currentTime=0;else loadSong(currentIndex-1);
});
$('next').addEventListener('click',()=>{if(songs.length)loadSong(currentIndex+1);});
audio.addEventListener('play',updatePlayButton);
audio.addEventListener('pause',updatePlayButton);
audio.addEventListener('ended',()=>{if(songs.length)loadSong(currentIndex+1);});
audio.addEventListener('loadedmetadata',()=>{
  $('duration').textContent=formatTime(audio.duration);
  $('seek').value=0;
});
audio.addEventListener('timeupdate',()=>{
  if(audio.duration){
    $('seek').value=audio.currentTime/audio.duration*100;
    $('current').textContent=formatTime(audio.currentTime);
  }
});
$('seek').addEventListener('input',()=>{
  if(audio.duration)audio.currentTime=Number($('seek').value)/100*audio.duration;
});
$('volume').addEventListener('input',()=>{
  audio.volume=Number($('volume').value);audio.muted=false;$('mute').textContent='Mute';
});
$('mute').addEventListener('click',()=>{
  audio.muted=!audio.muted;$('mute').textContent=audio.muted?'Unmute':'Mute';
});
audio.volume=.8;