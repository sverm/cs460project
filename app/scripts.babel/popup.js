var openpgp = window.openpgp;

openpgp.initWorker({ path:'bower_components/openpgp/dist/openpgp.worker.js' }) // set the relative web worker path

openpgp.config.aead_protect = true // activate fast AES-GCM mode (experimental)

function pgp_encrypt() {
  var options = {
    data: document.getElementById('input').value,
    passwords:[document.getElementById('password').value]
  };
  openpgp.encrypt(options).then(show_result);
}

function pgp_encrypt_keypair() {
  chrome.storage.sync.get(['pgp_pubkey', 'pgp_privkey'], function(result) {
    if (Object.keys(result).length === 0) {
      show_error('No key, generate a keypair to use');
    }
    var options = {
      data: document.getElementById('input').value,
      publicKeys: openpgp.key.readArmored(result.pgp_pubkey).keys,
      privateKey: openpgp.key.readArmored(result.pgp_privkey).keys[0],
      armor: false
    };
    openpgp.encrypt(options).then(show_result);
  });
};

function pgp_decrypt_keypair() {
  chrome.storage.sync.get(['pgp_pubkey', 'pgp_privkey'], function(result) {
    if (Object.keys(result).length === 0) {
      show_error('No key, generate a keypair to use');
      return;
    }
    
    var privkey = openpgp.key.readArmored(result.pgp_privkey).keys[0];
    if(!privkey.decrypt(document.getElementById('password').value)) {
      show_error('please enter valid password to decrypt');
      return;
    };

    var options = {
      message: openpgp.message.read(reverse(document.getElementById('input').value)),
      publicKeys: openpgp.key.readArmored(result.pgp_pubkey).keys,
      privateKey: privkey 
    };
    openpgp.decrypt(options).then(show_result);
  });
};

function pgp_decrypt() {
  var options = {
    message: openpgp.message.readArmored(document.getElementById('input').value),
    password: document.getElementById('password').value
  };
  openpgp.decrypt(options).then(show_result).catch(show_error);
}

function reverse(string) {
  return hexToBytes(string);
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join('');
}

function show_result(result) {
  if (result.message) {
    result.data = bytesToHex(result.message.packets.write());
  }
  document.getElementById('result').value = result && result.data ? result.data : result;
}

function show_error(input) {
  show_result(typeof input === 'string' ? input : 'error');
}

function aes_encrypt() {
  var message = document.getElementById('input').value;
  var key = document.getElementById('password').value;
  var iv  = '0000000000000000';
  var encrypted = CryptoJS.AES.encrypt(message, key);
  show_result(encrypted);
}

function aes_decrypt() {
  var data = document.getElementById('input').value;
  var key = document.getElementById('password').value;
  show_result(CryptoJS.AES.decrypt(data,key).toString(CryptoJS.enc.Utf8));
}

function pgp_keygen() {
  var pubkey = chrome.storage.sync.get('pgp_pubkey', function (data) {
    if (Object.keys(data).length != 0) {
      if (!confirm('Are you sure you want to create a new keypair? You already have one saved')) {
        return;
      }
    }

    show_result('generating...');
    var options = {
      userIds: [{ name : document.getElementById('name').value,
                  email: document.getElementById('email').value
      }],
      numBits: 4096,
      passphrase: document.getElementById('passphrase').value
    }

    openpgp.generateKey(options)
      .then(function(key) {
        chrome.storage.sync.set({
          pgp_pubkey: key.publicKeyArmored,
          pgp_privkey: key.privateKeyArmored
        }, function() {
           show_result('generated succesfully');
        });
      })
      .catch(show_error);
  });
}


document.getElementById('pgp_encrypt').onclick = pgp_encrypt;
document.getElementById('pgp_decrypt').onclick = pgp_decrypt;
document.getElementById('aes_encrypt').onclick = aes_encrypt;
document.getElementById('aes_decrypt').onclick = aes_decrypt;
document.getElementById('pgp_keygen').onclick = pgp_keygen;
document.getElementById('pgp_encrypt_keypair').onclick = pgp_encrypt_keypair;
document.getElementById('pgp_decrypt_keypair').onclick = pgp_decrypt_keypair;
