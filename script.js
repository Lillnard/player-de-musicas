const capaDisco = document.getElementById('capa');
const loading = document.getElementById('loading');

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

const volume = document.getElementById('volume');
const mute = document.getElementById('mute');

const btnFila = document.getElementById('btn-fila');
const fila = document.getElementById('fila');
const fecharFila = document.getElementById('fechar-fila');
const filaLista = document.getElementById('fila-lista');

let embaralhado = false;
let repetindo = false;

let index = 0;
let playlistEmbaralhada = [];
let dragging = false;

// ---------- Playlist ----------
const patience = { nomeDaMusica: "Patience", nomeDoArtista: "Guns N' Roses", arquivo: "patience", like: false };
const beiraMar = { nomeDaMusica: "Beira-Mar", nomeDoArtista: "Zé Ramalho", arquivo: "beira_mar", like: false };
const habeasCorpus = { nomeDaMusica: "Habeas Corpus", nomeDoArtista: "Baia", arquivo: "habeas_corpus", like: false };
const iWannaBeAdored = { nomeDaMusica: "I Wanna Be Adored", nomeDoArtista: "The Stone Roses", arquivo: "i_wanna_be_adored", like: false };
const ifIHadAGun = { nomeDaMusica: "If I Had A Gun", nomeDoArtista: "Noel Gallagher's High Flying Birds", arquivo: "if_i_had_a_gun", like: false };
const imOnFire = { nomeDaMusica: "I'm On Fire", nomeDoArtista: "Bruce Springsteen", arquivo: "im_on_fire", like: false };
const itsAllOverNowBabyBlue = { nomeDaMusica: "It's All Over Now, Baby Blue", nomeDoArtista: "Bob Dylan", arquivo: "its_all_over_now_baby_blue", like: false };
const justLikeHeaven = { nomeDaMusica: "Just Like Heaven", nomeDoArtista: "The Cure", arquivo: "just_like_heaven", like: false };
const justLikeHoney = { nomeDaMusica: "Just Like Honey", nomeDoArtista: "The Jesus And Mary Chain", arquivo: "just_like_honey", like: false };
const missAtomicBomb = { nomeDaMusica: "Miss Atomic Bomb", nomeDoArtista: "The Killers", arquivo: "miss_atomic_bomb", like: false };
const trouble = { nomeDaMusica: "Trouble", nomeDoArtista: "Yusuf / Cat Stevens", arquivo: "trouble", like: false };

const playlistPadrao = [patience, ifIHadAGun, imOnFire, itsAllOverNowBabyBlue, trouble, iWannaBeAdored, missAtomicBomb, beiraMar, justLikeHeaven, justLikeHoney, habeasCorpus];

// playlistOrdenada salva com likes etc
const playlistOrdenada = JSON.parse(localStorage.getItem('playlist')) ?? playlistPadrao;

// ---------- Estado persistente ----------
const STORAGE_KEY = 'player_state_v1';

function getState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {
    indexArquivo: playlistOrdenada[0]?.arquivo ?? '',
    currentTime: 0,
    playing: false,
    volume: 0.8,
    muted: false,
    embaralhado: false,
    repetindo: false,
    filaAberta: false
  };
}

function setState(patch) {
  const atual = getState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...atual, ...patch }));
}

// ---------- Utils ----------
function converteTempo(tempoOriginal) {
  if (!Number.isFinite(tempoOriginal) || tempoOriginal < 0) return "00:00:00";
  let hora = Math.floor(tempoOriginal / 3600);
  let minuto = Math.floor((tempoOriginal - hora * 3600) / 60);
  let segundos = Math.floor(tempoOriginal - hora * 3600 - minuto * 60);
  return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function mostraLoading(show) {
  if (show) {
    loading.classList.add('show');
    capaDisco.classList.add('loading-state');
    tempoTotal.innerText = "Carregando...";
  } else {
    loading.classList.remove('show');
    capaDisco.classList.remove('loading-state');
  }
}

function isPlaying() {
  return !musica.paused && !musica.ended;
}

function setPlayUI(playing) {
  if (playing) {
    play.classList.add('hide');
    pause.classList.remove('hide');
  } else {
    pause.classList.add('hide');
    play.classList.remove('hide');
  }
}

function findIndexByArquivo(arr, arquivo) {
  return arr.findIndex(m => m.arquivo === arquivo);
}

// ---------- Shuffle ----------
function embaralhaPlaylist(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function aplicaEmbaralhado(on) {
  const musicaAtualArquivo = playlistEmbaralhada[index]?.arquivo ?? playlistOrdenada[index]?.arquivo;

  embaralhado = on;

  if (embaralhado) {
    playlistEmbaralhada = embaralhaPlaylist(playlistOrdenada);
    embaralhar.classList.add('ativo');
  } else {
    playlistEmbaralhada = [...playlistOrdenada];
    embaralhar.classList.remove('ativo');
  }

  // manter a mesma música selecionada após mudar o modo
  const novoIndex = findIndexByArquivo(playlistEmbaralhada, musicaAtualArquivo);
  index = novoIndex >= 0 ? novoIndex : 0;

  setState({ embaralhado });
  renderFila();
}

// ---------- Repeat 1 ----------
function aplicaRepeticao(on) {
  repetindo = on;
  if (repetindo) {
    repetir.classList.add('hide');
    repetir1.classList.remove('hide');
    repetir1.classList.add('ativo');
  } else {
    repetir1.classList.remove('ativo');
    repetir1.classList.add('hide');
    repetir.classList.remove('hide');
  }
  setState({ repetindo });
}

// ---------- Like ----------
function curteMusica() {
  if (playlistEmbaralhada[index].like === true) {
    curtir.querySelector('.bi').classList.remove('bi-heart');
    curtir.querySelector('.bi').classList.add('bi-heart-fill');
    curtir.classList.add('ativo');
  } else {
    curtir.querySelector('.bi').classList.add('bi-heart');
    curtir.querySelector('.bi').classList.remove('bi-heart-fill');
    curtir.classList.remove('ativo');
  }
  renderFila();
}

function curteMusicaClick() {
  const arquivoAtual = playlistEmbaralhada[index].arquivo;
  const idxOrdenada = findIndexByArquivo(playlistOrdenada, arquivoAtual);
  if (idxOrdenada >= 0) {
    playlistOrdenada[idxOrdenada].like = !playlistOrdenada[idxOrdenada].like;
  }
  // refletir no array atual
  const idxAtual = findIndexByArquivo(playlistEmbaralhada, arquivoAtual);
  if (idxAtual >= 0) {
    playlistEmbaralhada[idxAtual].like = playlistOrdenada[idxOrdenada].like;
  }

  curteMusica();
  localStorage.setItem('playlist', JSON.stringify(playlistOrdenada));
}

// ---------- Carregar música ----------
function carregaMusica() {
  mostraLoading(true);

  const faixa = playlistEmbaralhada[index];
  capaDisco.src = `./imagens/${faixa.arquivo}.jpg`;
  musica.src = `./musicas/${faixa.arquivo}.mp3`;
  nomeMusica.innerText = faixa.nomeDaMusica;
  nomeArtista.innerText = faixa.nomeDoArtista;

  // atualiza like UI
  curteMusica();

  // salva no estado (arquivo atual)
  setState({ indexArquivo: faixa.arquivo });
}

function voltaMusica() {
  index = (index === 0) ? (playlistEmbaralhada.length - 1) : (index - 1);
  carregaMusica();
  musica.play();
}

function avancaMusica() {
  index = (index === playlistEmbaralhada.length - 1) ? 0 : (index + 1);
  carregaMusica();
  musica.play();
}

function proximaMusica() {
  if (!repetindo) {
    avancaMusica();
  } else {
    musica.currentTime = 0;
    musica.play();
  }
}

// ---------- Progresso ----------
function atualizaProgresso() {
  if (!Number.isFinite(musica.duration) || musica.duration <= 0) return;

  const tamanhoBarra = (musica.currentTime / musica.duration) * 100;
  barra.style.setProperty('--progresso', `${tamanhoBarra}%`);  tempoAtual.innerText = converteTempo(musica.currentTime);

  // salvar de tempos em tempos
  if (!dragging) setState({ currentTime: musica.currentTime });
}

function avancarParaOffset(offsetX) {
  const barra = document.getElementById('barra-progresso');
  const largura = barra.clientWidth;
  const clamped = Math.max(0, Math.min(offsetX, largura));
  const avancarParaOTempo = (clamped / largura) * musica.duration;
  musica.currentTime = avancarParaOTempo;
  setState({ currentTime: musica.currentTime });
}

function onPointerDown(e) {
  dragging = true;
  const barra = document.getElementById('barra-progresso');
  barra.setPointerCapture(e.pointerId);
  avancarParaOffset(e.offsetX);
}

function onPointerMove(e) {
  if (!dragging) return;
  avancarParaOffset(e.offsetX);
}

function onPointerUp(e) {
  dragging = false;
}

// ---------- Tempo total ----------
function atualizaTempoTotal() {
  if (Number.isFinite(musica.duration) && musica.duration > 0) {
    tempoTotal.innerText = converteTempo(musica.duration);
    mostraLoading(false);
  }
}

// ---------- Play/Pause ----------
function tocaMusica() {
  musica.play();
  setPlayUI(true);
  setState({ playing: true });
}

function pausaMusica() {
  musica.pause();
  setPlayUI(false);
  setState({ playing: false });
}

// ---------- Volume / Mute ----------
function aplicaVolume(vol) {
  musica.volume = vol;
  volume.value = String(vol);
  setState({ volume: vol });
  atualizaIconeVolume();
}

function aplicaMute(on) {
  musica.muted = on;
  setState({ muted: on });
  atualizaIconeVolume();
}

function atualizaIconeVolume() {
  const icon = mute.querySelector('.bi');
  icon.classList.remove('bi-volume-up', 'bi-volume-mute', 'bi-volume-down');

  if (musica.muted || musica.volume === 0) icon.classList.add('bi-volume-mute');
  else if (musica.volume < 0.5) icon.classList.add('bi-volume-down');
  else icon.classList.add('bi-volume-up');
}

// ---------- Fila ----------
function toggleFila(open) {
  const shouldOpen = (typeof open === 'boolean') ? open : fila.classList.contains('hide');
  if (shouldOpen) fila.classList.remove('hide');
  else fila.classList.add('hide');
  setState({ filaAberta: shouldOpen });
}

function renderFila() {
  filaLista.innerHTML = '';

  playlistEmbaralhada.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = 'fila-item' + (i === index ? ' ativa' : '');
    li.dataset.index = i;

    const meta = document.createElement('div');
    meta.className = 'meta';

    const titulo = document.createElement('div');
    titulo.className = 'm';
    titulo.textContent = m.nomeDaMusica;

    const artista = document.createElement('div');
    artista.className = 'a';
    artista.textContent = m.nomeDoArtista;

    meta.appendChild(titulo);
    meta.appendChild(artista);

    const like = document.createElement('div');
    like.className = 'like';
    like.innerHTML = m.like ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';

    li.appendChild(meta);
    li.appendChild(like);

    li.addEventListener('click', () => {
      index = i;
      carregaMusica();
      tocaMusica();
      renderFila();
    });

    filaLista.appendChild(li);
  });
}

// ---------- Teclado ----------
function atalhosTeclado(e) {
  // evitar capturar em input range (volume)
  const tag = (document.activeElement?.tagName || '').toLowerCase();
  if (tag === 'input') return;

  if (e.code === 'Space') {
    e.preventDefault();
    isPlaying() ? pausaMusica() : tocaMusica();
  }

  if (e.code === 'ArrowRight') {
    musica.currentTime = Math.min((musica.currentTime + 5), musica.duration || musica.currentTime + 5);
    setState({ currentTime: musica.currentTime });
  }

  if (e.code === 'ArrowLeft') {
    musica.currentTime = Math.max(0, musica.currentTime - 5);
    setState({ currentTime: musica.currentTime });
  }

  if (e.key.toLowerCase() === 'n') avancaMusica();
  if (e.key.toLowerCase() === 'p') voltaMusica();
}

// ---------- Inicialização ----------
function init() {
  // base: começa ordenada
  playlistEmbaralhada = [...playlistOrdenada];

  const state = getState();

  // aplicar shuffle e repeat
  aplicaEmbaralhado(!!state.embaralhado);
  aplicaRepeticao(!!state.repetindo);

  // descobrir index pelo arquivo salvo
  const idx = findIndexByArquivo(playlistEmbaralhada, state.indexArquivo);
  index = idx >= 0 ? idx : 0;

  // carregar música
  carregaMusica();

  // aplicar volume/mute
  aplicaVolume(typeof state.volume === 'number' ? state.volume : 0.8);
  aplicaMute(!!state.muted);

  // restaurar fila aberta/fechada
  toggleFila(!!state.filaAberta);

  // render fila
  renderFila();

  // restaurar tempo e play quando possível
  musica.addEventListener('loadedmetadata', () => {
    atualizaTempoTotal();

    if (Number.isFinite(state.currentTime) && state.currentTime > 0 && state.currentTime < musica.duration) {
      musica.currentTime = state.currentTime;
      tempoAtual.innerText = converteTempo(musica.currentTime);
    }

    if (state.playing) tocaMusica();
    else setPlayUI(false);
  }, { once: true });
}

init();

// ---------- Eventos ----------
play.addEventListener('click', tocaMusica);
pause.addEventListener('click', pausaMusica);

avancar.addEventListener('click', avancaMusica);
voltar.addEventListener('click', voltaMusica);

embaralhar.addEventListener('click', () => aplicaEmbaralhado(!embaralhado));

repetir.addEventListener('click', () => aplicaRepeticao(true));
repetir1.addEventListener('click', () => aplicaRepeticao(false));

curtir.addEventListener('click', curteMusicaClick);

// double click na capa para curtir
capaDisco.addEventListener('dblclick', curteMusicaClick);

musica.addEventListener('timeupdate', atualizaProgresso);
musica.addEventListener('ended', proximaMusica);
musica.addEventListener('loadedmetadata', atualizaTempoTotal);
musica.addEventListener('canplay', () => mostraLoading(false));

document.addEventListener('keydown', atalhosTeclado);

// Progresso com drag (pointer)
const barra = document.getElementById('barra-progresso');
barra.addEventListener('pointerdown', onPointerDown);
barra.addEventListener('pointermove', onPointerMove);
barra.addEventListener('pointerup', onPointerUp);
barra.addEventListener('pointercancel', onPointerUp);

// Também permite clique no container (sem duplicar listener)
progressoContainer.addEventListener('click', (e) => {
  // se clicou na barra já tratou, evita “duplo”
  if (e.target === barra || e.target.id === 'progresso' || e.target.id === 'thumb') return;
  const rect = barra.getBoundingClientRect();
  avancarParaOffset(e.clientX - rect.left);
});

// Volume
volume.addEventListener('input', (e) => {
  const v = Number(e.target.value);
  aplicaMute(false);
  aplicaVolume(v);
});

mute.addEventListener('click', () => {
  aplicaMute(!musica.muted);
});

// Fila
btnFila.addEventListener('click', () => toggleFila());
fecharFila.addEventListener('click', () => toggleFila(false));

// Persistir playing state se o usuário der play/pause fora
musica.addEventListener('play', () => setState({ playing: true }));
musica.addEventListener('pause', () => setState({ playing: false }));

musica.addEventListener('error', () => {
    console.error("Erro ao carregar a música:", musica.src);
});