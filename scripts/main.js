window.addEventListener('load', () => {
  console.log("Hello, JS!");

  ymaps.ready(initMap);
})

function initMap() {
  const mapContainer = document.querySelector('.d-map');
  const map = mapContainer.querySelector('#js-yandex-map');
  if (!map) return;

  const tekoMap = new ymaps.Map(map, {
    center: [mapContainer.dataset.initialLongitude, mapContainer.dataset.initialLatitude],
    zoom: mapContainer.dataset.initialZoom,
    controls: []
  }, {
    yandexMapDisablePoiInteractivity: true,
    suppressMapOpenBlock: true
  });

  tekoMap.behaviors.disable('scrollZoom');

  _getData(mapContainer, tekoMap);
}

function _getData(mapContainer, map) {
  const url = mapContainer.dataset.url;

  fetch(url)
    .then(res => {
      return res.json()
    })
    .then(data => {
      const listContainer = document.querySelector('#js-map-list-container');

      data.groups.forEach(group => {
        _renderGroupItem(listContainer, {
          image: group.groupIcon,
          count: group.places.length,
          text: group.groupLabel
        })
        
        group.places.forEach(place => {
          _addPlace(map, {
            coords: place.coords,
            image: group.groupIcon
          });
        })
      })
    })
    .catch(err => {
      console.warn(err);
    })
}

function _addPlace(map, {coords, image}) {
  const placemarkProperties = {};

  const placemarkOptions = {
    iconLayout: 'default#image',
    iconImageHref: image,
    iconImageSize: [40, 40],
    iconImageOffset: [0, 0]
  };

  const placemark = new ymaps.Placemark(coords, placemarkProperties, placemarkOptions);

  map.geoObjects.add(placemark);
}

function _renderGroupItem(container, {image, count, text}) {
  const itemHTML =`
    <li class="d-map__place place">
      <div class="place__image-wrapper">
        <img src="${image}" alt="${text}">
      </div>
      <div class="place__description">
        <h3>${count}</h3>
        <p>${text}</p>
      </div>
    </li>`;

  container.innerHTML += itemHTML;
}