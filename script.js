const capaDisco = document.getElementById('capa');
const nomeMusica = document.getElementById('nome-musica');
const nomeArtista = document.getElementById('nome-artista');
const musica = document.getElementById('audio');
const progresso = document.getElementById('progresso');
const progressoContainer = document.getElementById('progresso-container');
const tempoAtual = document.getElementById('tempo-atual');
const tempoTotal = document.getElementById('tempo-total');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const avancar = document.getElementById('avancar');
const voltar = document.getElementById('retornar');
const embaralhar = document.getElementById('embaralhar');
const repetir = document.getElementById('repetir');
const repetir1 = document.getElementById('repetir1');
const curtir = document.getElementById('curtir');

let embaralhado = false;
let repetindo = false;

function tocaMusica() {
    play.addEventListener('click', () => {
        play.classList.add('hide');
        pause.classList.remove('hide');
        musica.play()
    });
};
tocaMusica();

function paraMusica() {
    pause.addEventListener('click', () => {
        pause.classList.add('hide')
        play.classList.remove('hide')
        musica.pause()
    })
}
paraMusica();


const patience = {
    nomeDaMusica: "Patience",
    nomeDoArtista: "Guns N' Roses",
    arquivo: "patience", 
    like: false
};
const beiraMar = {
    nomeDaMusica: "Beira-Mar",
    nomeDoArtista: "Zé Ramalho",
    arquivo: "beira_mar",
    like: false 
};
const habeasCorpus = {
    nomeDaMusica: "Habeas Corpus",
    nomeDoArtista: "Baia",
    arquivo: "habeas_corpus",
    like: false 
};
const iWannaBeAdored = {
    nomeDaMusica: "I Wanna Be Adored",
    nomeDoArtista: "The Stone Roses",
    arquivo: "i_wanna_be_adored", 
    like: false
};
const ifIHadAGun = {
    nomeDaMusica: "If I Had A Gun",
    nomeDoArtista: "Noel Gallagher's High Flying Birds",
    arquivo: "if_i_had_a_gun", 
    like: false
};
const imOnFire = {
    nomeDaMusica: "I'm On Fire",
    nomeDoArtista: "Bruce Springsteen",
    arquivo: "im_on_fire", 
    like: false
};
const itsAllOverNowBabyBlue = {
    nomeDaMusica: "Bob Dylan",
    nomeDoArtista: "It's All Over Now, Baby Blue",
    arquivo: "its_all_over_now_baby_blue", 
    like: false
};
const justLikeHeaven = {
    nomeDaMusica: "Just Like Heaven",
    nomeDoArtista: "The Cure",
    arquivo: "just_like_heaven", 
    like: false
};
const justLikeHoney = {
    nomeDaMusica: "Just Like Honey",
    nomeDoArtista: "The Jesus And Mary Chain",
    arquivo: "just_like_honey", 
    like: false
};
const missAtomicBomb = {
    nomeDaMusica: "Miss Atomic Bomb",
    nomeDoArtista: "The Killers",
    arquivo: "miss_atomic_bomb", 
    like: false
};
const trouble = {
    nomeDaMusica: "Trouble",
    nomeDoArtista: "Yusuf / Cat Stevens",
    arquivo: "trouble", 
    like: false
};

const playlistOrdenada = JSON.parse(localStorage.getItem('playlist')) ?? [patience, ifIHadAGun, imOnFire, itsAllOverNowBabyBlue, trouble, iWannaBeAdored, missAtomicBomb, beiraMar, justLikeHeaven, justLikeHoney, habeasCorpus];
let index = 0;
let playlistEmbaralhada = [...playlistOrdenada]; 


function carregaMusica() {
    capaDisco.src = `./imagens/${playlistEmbaralhada[index].arquivo}.jpg`;
    musica.src = `./musicas/${playlistEmbaralhada[index].arquivo}.mp3`;
    nomeMusica.innerText = playlistEmbaralhada[index].nomeDaMusica;
    nomeArtista.innerText = playlistEmbaralhada[index].nomeDoArtista;
    curteMusica()
}
carregaMusica();

function voltaMusica() {
    if (index === 0){
        index = playlistEmbaralhada.length - 1;
    } else {
        index -= 1; 
    }
    carregaMusica();
    musica.play();
    play.classList.add('hide');
    pause.classList.remove('hide');
};

function avancaMusica() {
    if (index === playlistEmbaralhada.length - 1){
        index = 0;
    } else {
        index += 1; 
    }
    carregaMusica();
    musica.play();
    play.classList.add('hide');
    pause.classList.remove('hide');
};

function atualizaProgresso() {
    const tamanhoBarra = (musica.currentTime/musica.duration)*100;
    progresso.style.setProperty('--progresso', `${tamanhoBarra}%`)
    tempoAtual.innerText = converteTempo(musica.currentTime);
}

function avancarPara(event) {
    const largura = progressoContainer.clientWidth;
    const localClicado = event.offsetX;
    const avancarParaOTempo = (localClicado/largura)* musica.duration;
    musica.currentTime = avancarParaOTempo;
}

function embaralhaPlaylist(preEmbaralhaPlaylist) {
    const tamanho = preEmbaralhaPlaylist.length;
    let indexAtual = tamanho - 1;
    while(indexAtual > 0){
        let indexAleatorio = Math.floor(Math.random()* tamanho);
        let auxiliar = preEmbaralhaPlaylist[indexAtual];
        preEmbaralhaPlaylist[indexAtual] = preEmbaralhaPlaylist[indexAleatorio];
        preEmbaralhaPlaylist[indexAleatorio] = auxiliar;
        indexAtual -= 1;
    };
}

function embaralha(){
    if(embaralhado === false){
        embaralhado = true;
        embaralhaPlaylist(playlistEmbaralhada);
        embaralhar.classList.add('ativo');
    }else{
        embaralhado = false;
        embaralhaPlaylist(...playlistOrdenada);
        embaralhar.classList.remove('ativo');
    };
}

function repeteMusica() {
    if(repetindo === false) {
        repetindo = true;
        repetir.classList.add('hide');
        repetir1.classList.remove('hide');
        repetir1.classList.add('ativo');
    } else {
        repetindo = false;
        repetir1.classList.remove('ativo');
        repetir1.classList.add('hide');
        repetir.classList.remove('hide');
    };
};

function proximaMusica() {
    if(repetindo === false) {
        avancaMusica();
    } else {
        musica.play();
    }
}

function converteTempo(tempoOriginal) {
    let hora = Math.floor(tempoOriginal / 3600);
    let minuto = Math.floor((tempoOriginal - hora * 3600) / 60);
    let segundos = Math.floor(tempoOriginal - hora * 3600 - minuto * 60);

    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function atualizaTempoTotal() {
    tempoTotal.innerText = converteTempo(musica.duration);
}

function curteMusica() {
    if(playlistEmbaralhada[index].like === true) {
        curtir.querySelector('.bi').classList.remove('bi-heart');
        curtir.querySelector('.bi').classList.add('bi-heart-fill');
        curtir.classList.add('ativo');
    } else {
        curtir.querySelector('.bi').classList.add('bi-heart');
        curtir.querySelector('.bi').classList.remove('bi-heart-fill');
        curtir.classList.remove('ativo');
    }
}

function curteMusicaClick() {
    if(playlistEmbaralhada[index].like === false) {
        playlistEmbaralhada[index].like = true;
    } else {
        playlistEmbaralhada[index].like = false;
    }
    curteMusica();
    localStorage.setItem('playlist', JSON.stringify(playlistOrdenada));
}


avancar.addEventListener('click' , avancaMusica);
voltar.addEventListener('click', voltaMusica);
musica.addEventListener('timeupdate', atualizaProgresso);
musica.addEventListener('ended', proximaMusica);
musica.addEventListener('loadedmetadata', atualizaTempoTotal);
progressoContainer.addEventListener('click', avancarPara);
progressoContainer.addEventListener('click', avancarPara);
embaralhar.addEventListener('click', embaralha);
repetir.addEventListener('click', repeteMusica);
repetir1.addEventListener('click', repeteMusica);
curtir.addEventListener('click', curteMusicaClick);
