const scenes = [
  {
    id: "aizu-river",
    title: "川沿いの朝霧",
    location: "会津若松・只見川",
    lat: 37.4958,
    lng: 139.9247,
    note: "霧が晴れる瞬間を長回しで収録。環境音を重視。",
    time: "早朝",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "iwaki-port",
    title: "港の灯り",
    location: "いわき市・小名浜港",
    lat: 36.9495,
    lng: 140.9096,
    note: "夜明け前の漁港で光と影のコントラストを撮影。",
    time: "夜明け",
    video: "", // 動画がない場合は画像を表示
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "soma-field",
    title: "野馬追の跡",
    location: "南相馬市・原町区",
    lat: 37.6426,
    lng: 140.9575,
    note: "草原を風が抜ける音をそのまま収録し、静けさを描写。",
    time: "夕方",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80"
  }
];

// IDを変更: map-container (変更なしだが確認)
const map = L.map("map-container", {
  zoomControl: false,
  scrollWheelZoom: false // スクロール地図操作はOFFにして、ページスクロールを優先
}).setView([37.5, 140.4], 9);

// ズームコントロール 左下に移動してコンテンツと被らないようにする
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// ダークテーマ用のフィルタクラスを追加
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors',
  className: 'dark-map-tiles' // CSSフィルタ適用
}).addTo(map);

// 福島第一原子力発電所の座標
const fukushimaDaiichiPos = [37.4213, 141.0325];

// 半径30kmの円を追加
L.circle(fukushimaDaiichiPos, {
  color: '#ff4444',      // 枠線の色（赤）
  fillColor: '#ff4444',  // 塗りつぶしの色
  fillOpacity: 0.1,      // 塗りつぶしの透明度
  radius: 30000,         // 半径（メートル）
  weight: 1,
  dashArray: '4, 4'
}).addTo(map);

// 中心点（原発位置）を追加
L.circleMarker(fukushimaDaiichiPos, {
  color: '#ff4444',
  fillColor: '#ff4444',
  fillOpacity: 1,
  radius: 4,             // 点のサイズ
  weight: 0
}).addTo(map).bindPopup("<strong>Fukushima Daiichi<br>Nuclear Power Plant</strong>");

// マーカーを管理するオブジェクトを作成
const markers = {};

scenes.forEach((scene) => {
  const marker = L.marker([scene.lat, scene.lng]).addTo(map);
  // カスタムポップアップHTML
  marker.bindPopup(
    `<img src="${scene.image}" alt="${scene.title}" />
     <div class="leaflet-popup-text">
       <h4>${scene.title}</h4>
       <p>${scene.location} / ${scene.time}</p>
       <p style="margin-top:8px; color:#fff;">${scene.note}</p>
     </div>
    `
  );
  markers[scene.id] = marker; // IDでマーカーを参照できるように保存
});

const sceneGrid = document.getElementById("scene-grid");

// Intersection Observerの設定
// rootをnullにするとビューポート(画面全体)が基準になります
const observerOptions = {
  root: null,
  rootMargin: '-50% 0px -50% 0px', // 画面のど真ん中の線を超えたら反応
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sceneId = entry.target.dataset.id;
      const scene = scenes.find(s => s.id === sceneId);

      if (scene) {
        // マップ移動 (durationを少し長くしてゆったりと)
        map.flyTo([scene.lat, scene.lng], 13, {
          duration: 2.5,
          easeLinearity: 0.2
        });

        // ポップアップを開く
        const marker = markers[sceneId];
        if (marker) {
          marker.openPopup();
        }

        // カードのアクティブ状態を切り替え
        document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('active'));
        entry.target.classList.add('active');
      }
    }
  });
}, observerOptions);

function renderSceneCards(list) {
  sceneGrid.innerHTML = "";
  list.forEach((scene) => {
    const card = document.createElement("article");
    card.className = "scene-card";
    card.dataset.id = scene.id;

    // 動画があるかチェック
    let mediaHtml = "";
    if (scene.video) {
        mediaHtml = `<div class="media-container">
                       <video src="${scene.video}" controls playsinline preload="metadata"></video>
                     </div>`;
    } else if (scene.image) {
        mediaHtml = `<div class="media-container">
                       <img src="${scene.image}" alt="${scene.title}" />
                     </div>`;
    }

    card.innerHTML = `
      ${mediaHtml}
      <div class="card-content">
        <span class="tag">${scene.time}</span>
        <h4>${scene.title}</h4>
        <p class="body" style="font-weight:600; margin-bottom:4px;">${scene.location}</p>
        <p class="body">${scene.note}</p>
      </div>
    `;

    // カードクリックでマップ移動（手動操作用）
    card.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    card.style.cursor = 'pointer';

    sceneGrid.appendChild(card);
    observer.observe(card);
  });
}

renderSceneCards(scenes);

// スクロールボタンの機能: タイトルセクションへ飛ぶように変更
window.scrollToScenes = function() {
    document.querySelector('#scenes-intro').scrollIntoView({ behavior: 'smooth' });
};
