const NNPath = '../../neuralNets/';

//const NNWristVersion = '14';
//const NNRingVersion = '8';

const NNWristVersion = '18';
const NNRingVersion = '12'; //*/

var wristURL = '';
var ringURL = '';
var occluderURL = '';
var debugHandURL = '';

var echoDB;
const API_KEY = 'divine-art-5199';

var ringModesCommonSettings;
var wristModelCommonSettings;
var ringModelCommonSettings;
var _settings;
var entries = []

/**
 * TODO: enhancement
 * Be able to hold any number of ring and wrist models
 */
var ringModels = [];
var wristModels = [];

// get the storage name of assets
// must run prior to the main function
let loadEchoAssets = async () => {
  // Query echo3D
  let response = await fetch('https://api.echo3D.co/query?key=' + API_KEY);
  let results = await response.json();
  echoDB = results;
  //console.log(echoDB);

  // parse the response to get the asset based on asset meta data
  var db = Object.values(echoDB.db);

  // Parse echo3D database
  for (let entry of db) { // Iterage over all database entries and look for entry with additionalData 
    // Parse entry
    var typeFile = entry['hologram'].filename.toLowerCase().split('.').pop();
    if (entry['hologram'].type === 'MODEL_HOLOGRAM' && typeFile === 'glb') {
      if (entry['additionalData'].activeRing !== undefined && entry['additionalData'].activeRing === 'true') {
        // TODO consider populating an array of ring objects to rotate through
        ringURL = 'https://storage.echo3d.co/' + API_KEY + '/' + entry['hologram'].storageID;
        entries['ringEntry'] = entry;
      }
      if (entry['additionalData'].activeWrist !== undefined && entry['additionalData'].activeWrist === 'true') {
        // TODO consider populating an array of wrist objects to rotate through
        wristURL = 'https://storage.echo3d.co/' + API_KEY + '/'+ entry['hologram'].storageID;
        entries['wristEntry'] = entry;
      }
      if (entry['additionalData'].activeOccluder !== undefined && entry['additionalData'].activeOccluder === 'true') {
        occluderURL = 'https://storage.echo3d.co/' + API_KEY + '/' + entry['hologram'].storageID;
        entries['occluderEntry'] = entry; // currently unused
      }
      if (entry['additionalData'].activeDebugHand !== undefined && entry['additionalData'].activeDebugHand === 'true') {
        debugHandURL = 'https://storage.echo3d.co/' + API_KEY + '/' + entry['hologram'].storageID;
        entries['debugHandEntry'] = entry; // currently unused
      }
    }
  }

  //console.log(ringModels);

  // initiate the settings
  ringModesCommonSettings = {
    threshold: 0.9, // detection sensitivity, between 0 and 1

    poseLandmarksLabels: ["ringBack", "ringLeft", "ringRight", "ringPalm", "ringPalmTop", "ringBackTop",
      "ringBase0", "ringBase1", "ringMiddleFinger", "ringPinkyFinger", "ringBasePalm"], //*/
    isPoseFilter: false,

    // Occluder parameters:
    occluderType: "MODEL",
    occluderModelURL: occluderURL,
    occluderScale: 1,

    objectPointsPositionFactors: [1.0, 1.0, 1.0],
  };

  var additionalData = entries.wristEntry.additionalData;

  wristModelCommonSettings = {
    URL: wristURL,
    scale: Number(additionalData._scale),
    offset: additionalData._offset.split(',').map((x) => { return Number(x); }),
    //[0.076, -0.916, -0.504],
    quaternion: additionalData._quaternion.split(',').map((x) => { return Number(x); }),
    //entries.wristEntry.additionalData, // Format: X,Y,Z,W (and not W,X,Y,Z like Blender)
  };

  additionalData = entries.ringEntry.additionalData;

  ringModelCommonSettings = {
    URL: ringURL,

    scale: Number(additionalData._scale),//1.0,
    //scale: 0.421,
    offset: additionalData._offset.split(',').map((x) => { return Number(x); }), //[-1.66, -11.91, 0.26],
    quaternion: additionalData._quaternion.split(',').map((x) => { return Number(x); }),//[0.258, 0.016, -0.005, 0.966], // Format: X,Y,Z,W (and not W,X,Y,Z like Blender)
  };

  let _currentVTO = _settings === undefined ? null : _settings.currentVTO;
  let _currentModel = _settings === undefined ? null : _settings.currentModel;

  _settings = {
    VTOModes: {
      wrist: Object.assign({
        //NNsPaths: [NNPath + 'NN_WRIST_RP_' + NNWristVersion + '.json', NNPath + 'NN_WRIST_RB_' + NNWristVersion + '.json']
        NNsPaths: [NNPath + 'NN_WRIST_' + NNWristVersion + '.json']
      }, wristModesCommonSettings),

      ring: Object.assign({
        //NNsPaths: [NNPath + 'NN_RING_RP_' + NNRingVersion + '.json', NNPath + 'NN_RING_RB_' + NNRingVersion + '.json']
        NNsPaths: [NNPath + 'NN_RING_' + NNRingVersion + '.json']
      }, ringModesCommonSettings),
    },

    models: {
      wristDemo: Object.assign({
        VTOMode: 'wrist'
      }, wristModelCommonSettings),

      ringDemo: Object.assign({
        VTOMode: 'ring'
      }, ringModelCommonSettings)
    },
    initialModel: 'ringDemo',
    currentVTO: _currentVTO,
    currentModel: _currentModel,

    // debug flags:
    debugDisplayLandmarks: false,
    debugMeshMaterial: false,
    debugOccluder: false,
    debugWholeHand: false
  };

  return Promise.resolve();
}

const wristModesCommonSettings = {
  threshold: 0.92, // detection sensitivity, between 0 and 1

  poseLandmarksLabels: [
    // wristRightBottom not working
    "wristBack", "wristLeft", "wristRight", "wristPalm", "wristPalmTop", "wristBackTop", "wristRightBottom", "wristLeftBottom"
    //"wristBack", "wristRight", "wristPalm", "wristPalmTop", "wristBackTop", "wristLeft"
  ],
  isPoseFilter: true,

  // soft occluder parameters (soft because we apply a fading gradient)
  occluderType: "SOFTCYLINDER",
  occluderRadiusRange: [3.5, 4.5], // first value: minimum or interior radius of the occluder (full transparency).
  // second value: maximum or exterior radius of the occluder (full opacity, no occluding effect)
  occluderHeight: 48, // height of the cylinder
  occluderOffset: [0, 0, 0], // relative to the wrist 3D model
  occluderQuaternion: [0.707, 0, 0, 0.707], // rotation of Math.PI/2 along X axis,
  objectPointsPositionFactors: [1.0, 1.5, 1.0], // factors to apply to point positions to lower pose angles - dirty tweak
};

//_settings.debugOccluder = true;

let _VTOMode = null;
let _VTOModel = null;

const _states = {
  notLoaded: -1,
  loading: 0,
  idle: 1,
  running: 2,
  busy: 3
};
let _state = _states.notLoaded;
let _isSelfieCam = false;


function setFullScreen(cv) {
  const pixelRatio = window.devicePixelRatio || 1;
  cv.width = pixelRatio * window.innerWidth;
  cv.height = pixelRatio * window.innerHeight;
}


// entry point:
function main() {
  _state = _states.loading;

  // get canvases and size them:
  const handTrackerCanvas = document.getElementById('handTrackerCanvas');
  const VTOCanvas = document.getElementById('VTOCanvas');

  setFullScreen(handTrackerCanvas);
  setFullScreen(VTOCanvas);

  // initial VTO mode:
  const initialModelSettings = _settings.models[_settings.initialModel];
  _VTOMode = initialModelSettings.VTOMode; // "ring" or "wrist"
  const VTOModeSettings = _settings.VTOModes[_VTOMode];

  // initialize Helper:
  HandTrackerThreeHelper.init({
    stabilizationSettings: {
      switchNNErrorThreshold: 0.5
    },
    objectPointsPositionFactors: VTOModeSettings.objectPointsPositionFactors,
    poseLandmarksLabels: VTOModeSettings.poseLandmarksLabels,
    poseFilter: (VTOModeSettings.isPoseFilter) ? PoseFlipFilter.instance({}) : null,
    NNsPaths: VTOModeSettings.NNsPaths,
    threshold: VTOModeSettings.threshold,
    VTOCanvas: VTOCanvas,
    handTrackerCanvas: handTrackerCanvas,
    debugDisplayLandmarks: _settings.debugDisplayLandmarks,
  }).then(start).catch(function (err) {
    throw new Error(err);
  });

  return Promise.resolve();
}


function set_lighting(three) {
  const scene = three.scene;

  // TODO: customize
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 2);
  scene.add(hemiLight);

  const pointLight = new THREE.PointLight(0xffffff, 2);
  pointLight.position.set(0, 100, 0);
  scene.add(pointLight);
}


function change_VTOMode(newVTOMode) {
  console.log('INFO in main.js - change_VTOMode(): change VTO Mode to ', newVTOMode);

  // clear everything including occluders:
  HandTrackerThreeHelper.clear_threeObjects(true);

  const VTOModeSettings = _settings.VTOModes[newVTOMode];
  return HandTrackerThreeHelper.update({
    objectPointsPositionFactors: VTOModeSettings.objectPointsPositionFactors,
    poseLandmarksLabels: VTOModeSettings.poseLandmarksLabels,
    poseFilter: (VTOModeSettings.isPoseFilter) ? PoseFlipFilter.instance({}) : null,
    NNsPaths: VTOModeSettings.NNsPaths,
    threshold: VTOModeSettings.threshold
  }).then(function () {
    _VTOMode = newVTOMode;
    set_occluder();
  }).then(function () {
    _state = _states.idle;
  });
}


function load_model(modelId, threeLoadingManager) {
  if ((_state !== _states.running && _state !== _states.idle)
    || modelId === _VTOModel) {
    return; // model is already loaded or state is busy or loading
  }
  _state = _states.busy;
  const modelSettings = _settings.models[modelId];
  _settings.currentModel = modelId;

  // remove previous model but not occluders:
  HandTrackerThreeHelper.clear_threeObjects(false);

  // look if we should change the VTOMode:
  if (modelSettings.VTOMode !== _VTOMode) {
    change_VTOMode(modelSettings.VTOMode).then(function () {
      load_model(modelId, threeLoadingManager);
    });
    return;
  }

  // load new model:
  new THREE.GLTFLoader(threeLoadingManager).load(modelSettings.URL, function (model) {
    const me = model.scene.children[0]; // instance of THREE.Mesh
    me.scale.set(1, 1, 1);

    // tweak the material:
    if (_settings.debugMeshMaterial) {
      me.traverse(function (child) {
        if (child.material) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
    }

    // tweak position, scale and rotation:
    if (modelSettings.scale) {
      me.scale.multiplyScalar(modelSettings.scale);
    }
    if (modelSettings.offset) {
      const d = modelSettings.offset;
      const displacement = new THREE.Vector3(d[0], d[2], -d[1]); // inverse Y and Z
      me.position.add(displacement);
    }
    if (modelSettings.quaternion) {
      const q = modelSettings.quaternion;
      me.quaternion.set(q[0], q[2], -q[1], q[3]);
    }

    // add to the tracker:
    HandTrackerThreeHelper.add_threeObject(me);

    _state = _states.running;

  });
}


function start(three) {
  VTOCanvas.style.zIndex = 3; // fix a weird bug on iOS15 / safari

  set_lighting(three);

  three.loadingManager.onLoad = function () {
    console.log('INFO in main.js: All THREE.js stuffs are loaded');
    _state = _states.running;
  }

  if (_settings.debugWholeHand) {
    add_wholeHand(three.loadingManager);
  }

  set_occluder().then(function () {
    _state = _states.idle;
  }).then(function () {
    load_model(_settings.initialModel, three.loadingManager);
  });
}


function add_wholeHand(threeLoadingManager) {
  new THREE.GLTFLoader(threeLoadingManager).load(debugHandURL, function (model) {
    const debugHandModel = model.scene.children[0];
    debugHandModel.traverse(function (threeStuff) {
      if (threeStuff.material) {
        threeStuff.material = new THREE.MeshNormalMaterial();
      }
    })
    HandTrackerThreeHelper.add_threeObject(debugHandModel);
  });
}


function set_occluder() {
  const VTOModeSettings = _settings.VTOModes[_VTOMode];

  if (VTOModeSettings.occluderType === 'SOFTCYLINDER') {
    return add_softOccluder(VTOModeSettings);
  } else if (VTOModeSettings.occluderType === 'MODEL') {
    return add_hardOccluder(VTOModeSettings);
  } else { // no occluder specified
    return Promise.resolve();
  }
}


function add_hardOccluder(VTOModeSettings) {
  return new Promise(function (accept, reject) {
    new THREE.GLTFLoader().load(VTOModeSettings.occluderModelURL, function (model) {
      const me = model.scene.children[0]; // instance of THREE.Mesh
      me.scale.multiplyScalar(VTOModeSettings.occluderScale);

      if (_settings.debugOccluder) {
        me.material = new THREE.MeshNormalMaterial();
        return;
      }
      HandTrackerThreeHelper.add_threeOccluder(me);
      accept();
    });
  });
}


function add_softOccluder(VTOModeSettings) {
  // add a soft occluder (for the wrist for example):
  const occluderRadius = VTOModeSettings.occluderRadiusRange[1];
  const occluderMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(occluderRadius, occluderRadius, VTOModeSettings.occluderHeight, 32, 1, true),
    new THREE.MeshNormalMaterial()
  );
  const dr = VTOModeSettings.occluderRadiusRange[1] - VTOModeSettings.occluderRadiusRange[0];
  occluderMesh.position.fromArray(VTOModeSettings.occluderOffset);
  occluderMesh.quaternion.fromArray(VTOModeSettings.occluderQuaternion);
  HandTrackerThreeHelper.add_threeSoftOccluder(occluderMesh, occluderRadius, dr, _settings.debugOccluder);
  return Promise.resolve();
}


function flip_camera() {
  if (_state !== _states.running) {
    return;
  }
  _state = _states.busy;
  WEBARROCKSHAND.update_videoSettings({
    facingMode: (_isSelfieCam) ? 'environment' : 'user'
  }).then(function () {
    _isSelfieCam = !_isSelfieCam;
    _state = _states.running;
    // mirror canvas using CSS in selfie cam mode:
    document.getElementById('canvases').style.transform = (_isSelfieCam) ? 'rotateY(180deg)' : '';
    console.log('INFO in main.js: Camera flipped successfully');
  }).catch(function (err) {
    console.log('ERROR in main.js: Cannot flip camera -', err);
  });
}

/** Set up the websocket server */

var server = 'wss://api.echo3d.co/message-endpoint';
//var server = 'ws://localhost:8080/message-endpoint';
var reconnectInterval = 1000 * 3;
var ws;

const CONNECTED_TO_WS = 'CONNECTED_TO_WS';
const CONNECTION_LOST = 'CONNECTION_LOST';
const KEY = 'KEY';
const ADD_ENTRY = 'ADD_ENTRY';
const DELETE_ENTRY =  'DELETE_ENTRY';
const DATA_POST_ALL = 'DATA_POST_ALL';
const DATA_POST_ENTRY = 'DATA_POST_ENTRY';
const DATA_REMOVE_ALL = 'DATA_REMOVE_ALL';
const DATA_REMOVE_ENTRY = 'DATA_REMOVE_ENTRY';
const SESSION_INFO = 'SESSION_INFO';

var connect = function () {
  ws = new WebSocket(server);

  ws.onopen =  function () {
    ws.send("KEY|" + API_KEY);
  };

  ws.onmessage = function incoming(event) {
    let data = event.data;

    // parse message
    let msg = data.toString().split('|');
    
    if (msg.length > 0) {
      let eventType = msg[0];

      switch (eventType) {
        case CONNECTED_TO_WS:
        case CONNECTION_LOST:
        case KEY:
          break;
        case ADD_ENTRY:
        case DELETE_ENTRY:
        case DATA_POST_ENTRY:
        case DATA_POST_ALL:
        case DATA_REMOVE_ENTRY:
        case DATA_REMOVE_ALL:
          loadEchoAssets().then(function () {
            load_model(_settings.currentModel);
          });
          break;
        case SESSION_INFO:
          break;
      }
    }
  };

  ws.onerror = function () {
    console.log('socket error');
  };

  ws.onclose = function () {
    console.log('socket closed, reconnecting');
    setTimeout(connect, reconnectInterval);
  };
};

loadEchoAssets().then(main);
connect();