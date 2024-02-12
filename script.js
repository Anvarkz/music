$(function () {
  var playerTrack = $("#player-track"),
    bgArtwork = $("#bg-artwork"),
    bgArtworkUrl,
    albumName = $("#album-name"),
    trackName = $("#track-name"),
    albumArt = $("#album-art"),
    sArea = $("#s-area"),
    seekBar = $("#seek-bar"),
    trackTime = $("#track-time"),
    insTime = $("#ins-time"),
    sHover = $("#s-hover"),
    playPauseButton = $("#play-pause-button"),
    i = playPauseButton.find("i"),
    tProgress = $("#current-time"),
    tTime = $("#track-length"),
    seekT,
    seekLoc,
    seekBarPos,
    cM,
    ctMinutes,
    ctSeconds,
    curMinutes,
    curSeconds,
    durMinutes,
    durSeconds,
    playProgress,
    bTime,
    nTime = 0,
    buffInterval = null,
    tFlag = false,
    albums = [
      "Sarà perché ti amo",
      "Et si tu nexistais pas",
      "Ti amo",
      "Can't help falling",
      "Vivo per lei",
      "Bésame Mucho",
      "I Wanna Be Yours",
      "Время любви",
      "Стань моей молитвой",
      "Ты скажи"
    ],
    trackNames = [
      "Ricchi E Poveri",
      "Joe Dassin",
      "Umberto Tozzi",
      "Andrea Bocelli",
      "Andrea Bocelli",
      "Andrea Bocelli",
      "Arctic Monkeys",
      "Батырхан Шукенов",
      "Батырхан Шукенов",
      "Батырхан Шукенов"
    ],
    albumArtworks = ["_1", "_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_10"],
    trackUrl = [
      "https://track.pinkamuz.pro/download/333431b5303435318b37373133373436b20000/c51b70f3e1aec223643d1f6542eb8ec6/Richi%20%26%20Poveri%20-%20Sara%20Perche%20Ti%20Amo.mp3",
      "https://muzub.net/uploads/music/2024/02/Joe_Dassin_Et_si_tu_n_existais_pas.mp3",
      "https://track.pinkamuz.pro/download/b33432303733318d373230b334313736370300/184a8a1703b0e0ae3922d60146146000/Umberto%20Tozzi%20et%20Monica%20Bellucci%20-%20Ti%20Amo%20%28OST%20По%20ту%20сторону%20кровати%20De%20l%27autre%20cote%20du%20lit%29.mp3",
      "https://track.pinkamuz.pro/download/33363435348b37353732b43436300100/e807adcc13e11df10e93d72d59ac07e3/Andrea%20Bocelli%20-%20Amore-can%27t%20help%20falling%20in%20love.mp3",
      "https://track.pinkamuz.pro/download/3335313431883731353332b634b0340200/ab39e2118637848927894e678d5eccd3/Vivere%3A%20The%20Best%20of%20Andrea%20Bocelli%20-%20Vivo%20Per%20Lei%20%28feat.%20Giorgia%29.mp3",
      "https://eu.hitmotop.com/get/music/20170903/Andrea_Bocelli_-_Bsame_Mucho_48076839.mp3",
      "https://eu.hitmotop.com/get/music/20181019/Arctic_Monkeys_-_I_Wanna_Be_Yours_59782650.mp3",
      "https://eu.hitmotop.com/get/music/20190517/Batyrkhan_SHukenov_-_Vremya_lyubvi_Ostorozhno_milaya_devushka_2010_64265300.mp3",
      "https://eu.hitmotop.com/get/music/20210218/Batyrkhan_SHukenov_-_Stan_moejj_molitvojj_72706783.mp3",
      "https://eu.hitmotop.com/get/music/20191023/Batyrkhan_SHukenov_Vsjo_projjdjot_-_Ty_skazhi_67049989.mp3"
    ],
    playPreviousTrackButton = $("#play-previous"),
    playNextTrackButton = $("#play-next"),
    currIndex = -1;

  function playPause() {
    setTimeout(function () {
      if (audio.paused) {
        playerTrack.addClass("active");
        albumArt.addClass("active");
        checkBuffering();
        i.attr("class", "fas fa-pause");
        audio.play();
      } else {
        playerTrack.removeClass("active");
        albumArt.removeClass("active");
        clearInterval(buffInterval);
        albumArt.removeClass("buffering");
        i.attr("class", "fas fa-play");
        audio.pause();
      }
    }, 300);
  }

  function showHover(event) {
    seekBarPos = sArea.offset();
    seekT = event.clientX - seekBarPos.left;
    seekLoc = audio.duration * (seekT / sArea.outerWidth());

    sHover.width(seekT);

    cM = seekLoc / 60;

    ctMinutes = Math.floor(cM);
    ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

    if (ctMinutes < 0 || ctSeconds < 0) return;

    if (ctMinutes < 0 || ctSeconds < 0) return;

    if (ctMinutes < 10) ctMinutes = "0" + ctMinutes;
    if (ctSeconds < 10) ctSeconds = "0" + ctSeconds;

    if (isNaN(ctMinutes) || isNaN(ctSeconds)) insTime.text("--:--");
    else insTime.text(ctMinutes + ":" + ctSeconds);

    insTime.css({ left: seekT, "margin-left": "-21px" }).fadeIn(0);
  }

  function hideHover() {
    sHover.width(0);
    insTime.text("00:00").css({ left: "0px", "margin-left": "0px" }).fadeOut(0);
  }

  function playFromClickedPos() {
    audio.currentTime = seekLoc;
    seekBar.width(seekT);
    hideHover();
  }

  function updateCurrTime() {
    nTime = new Date();
    nTime = nTime.getTime();

    if (!tFlag) {
      tFlag = true;
      trackTime.addClass("active");
    }

    curMinutes = Math.floor(audio.currentTime / 60);
    curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

    durMinutes = Math.floor(audio.duration / 60);
    durSeconds = Math.floor(audio.duration - durMinutes * 60);

    playProgress = (audio.currentTime / audio.duration) * 100;

    if (curMinutes < 10) curMinutes = "0" + curMinutes;
    if (curSeconds < 10) curSeconds = "0" + curSeconds;

    if (durMinutes < 10) durMinutes = "0" + durMinutes;
    if (durSeconds < 10) durSeconds = "0" + durSeconds;

    if (isNaN(curMinutes) || isNaN(curSeconds)) tProgress.text("00:00");
    else tProgress.text(curMinutes + ":" + curSeconds);

    if (isNaN(durMinutes) || isNaN(durSeconds)) tTime.text("00:00");
    else tTime.text(durMinutes + ":" + durSeconds);

    if (
      isNaN(curMinutes) ||
      isNaN(curSeconds) ||
      isNaN(durMinutes) ||
      isNaN(durSeconds)
    )
      trackTime.removeClass("active");
    else trackTime.addClass("active");

    seekBar.width(playProgress + "%");

    if (playProgress == 100) {
      i.attr("class", "fa fa-play");
      seekBar.width(0);
      tProgress.text("00:00");
      albumArt.removeClass("buffering").removeClass("active");
      clearInterval(buffInterval);
    }
  }

  function checkBuffering() {
    clearInterval(buffInterval);
    buffInterval = setInterval(function () {
      if (nTime == 0 || bTime - nTime > 1000) albumArt.addClass("buffering");
      else albumArt.removeClass("buffering");

      bTime = new Date();
      bTime = bTime.getTime();
    }, 100);
  }

  function selectTrack(flag) {
    if (flag == 0 || flag == 1) ++currIndex;
    else --currIndex;

    if (currIndex > -1 && currIndex < albumArtworks.length) {
      if (flag == 0) i.attr("class", "fa fa-play");
      else {
        albumArt.removeClass("buffering");
        i.attr("class", "fa fa-pause");
      }

      seekBar.width(0);
      trackTime.removeClass("active");
      tProgress.text("00:00");
      tTime.text("00:00");

      currAlbum = albums[currIndex];
      currTrackName = trackNames[currIndex];
      currArtwork = albumArtworks[currIndex];

      audio.src = trackUrl[currIndex];

      nTime = 0;
      bTime = new Date();
      bTime = bTime.getTime();

      if (flag != 0) {
        audio.play();
        playerTrack.addClass("active");
        albumArt.addClass("active");

        clearInterval(buffInterval);
        checkBuffering();
      }

      albumName.text(currAlbum);
      trackName.text(currTrackName);
      albumArt.find("img.active").removeClass("active");
      $("#" + currArtwork).addClass("active");

      bgArtworkUrl = $("#" + currArtwork).attr("src");

      bgArtwork.css({ "background-image": "url(" + bgArtworkUrl + ")" });
    } else {
      if (flag == 0 || flag == 1) --currIndex;
      else ++currIndex;
    }
  }

  function initPlayer() {
    audio = new Audio();

    selectTrack(0);

    audio.loop = false;

    playPauseButton.on("click", playPause);

    sArea.mousemove(function (event) {
      showHover(event);
    });

    sArea.mouseout(hideHover);

    sArea.on("click", playFromClickedPos);

    $(audio).on("timeupdate", updateCurrTime);

    playPreviousTrackButton.on("click", function () {
      selectTrack(-1);
    });
    playNextTrackButton.on("click", function () {
      selectTrack(1);
    });
  }

  initPlayer();
});
