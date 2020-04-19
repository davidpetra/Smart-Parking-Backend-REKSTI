const parkir = async () => {

  // console.log("yuhu");
  await fetch(`https://smartparking-reksti.herokuapp.com/tiket`, {
    method: 'POST',
    mode:'cors',
    headers: {
      'Content-Type': 'application/json'
    },

  })
  .then((response)=> {
    return response.json();
     console.log(response);
  })
  .then((data)=>{
    console.log(data);
    window.localStorage.setItem('idTiket', data.result.id_tiket);
  })
  // console.log("yuhu2");
  // // console.log(" before idTiket");
  
  // // console.log(idTiket);
  // console.log(" after idTiket");


let urlPart = window.location.href.split('/');
window.location = urlPart.splice(0, urlPart.length-1).join('/') + '/pilihparkir.html';
};

const getTiket = async () => {
  let $ = (id) => document.getElementById(id);
  let id = window.localStorage.getItem('idTiket');
  let result = await fetch(`https://smartparking-reksti.herokuapp.com/tiket/${id}`);
  console.log(result);
  //let result = await fetch('https://smartparking-reksti.herokuapp.com/tiket/34');
  let json = await result.json();
  console.log(json);
  console.log(json.id_tiket);
  // let item = json[0];
  // console.log(item);

  let idElem = $('id_tiket');
  let jamElem = $('jam_masuk');
  let statusElem = $('status');

  idElem.value = json.id_tiket;
  jamElem.value = json.jam_masuk;
  statusElem.value = json.status;
};



const getSlotParkir = async () => {
  let $ = (id) => document.getElementById(id);

  let result = await fetch('https://smartparking-reksti.herokuapp.com/parkiran');
  let json = await result.json();

  //let a1Elem = $('A1');

  //untuk lantai 1 code A

  for (i = 1; i<11 ; i++){
    var str1 = "a"+i.toString()+"Elem = $('A'+ i.toString())"
    var str2 = "b"+i.toString()+"Elem = $('B'+ i.toString())"
    eval(str1);
    eval(str2);
    console
  }

  for(i = 1; i<10; i++){
    if(json[i-1].slot_parkir == "A0"+i.toString()){
      if (json[i-1].availability == true){
        var str1 = "a"+i.toString()+"Elem.setAttribute('class','btn btn-success')"
        eval(str1);
      }else{
        var str1 = "a"+i.toString()+"Elem.setAttribute('class','btn btn-danger')"
        eval(str1);
      }
    }
    if (json[i+9].slot_parkir == "B0"+i.toString()){
      if (json[i+9].availability == true){
        var str2 = "b"+i.toString()+"Elem.setAttribute('class','btn btn-success')"
        eval(str2);
      }else{
        var str2 = "b"+i.toString()+"Elem.setAttribute('class','btn btn-danger')"
        eval(str2);
      }
    }
  };

  if(json[9].slot_parkir == "A10"){
    if (json[9].availability == true) {
      a10Elem.setAttribute('class', 'btn btn-success')}
    else {
      a10Elem.setAttribute('class', 'btn btn-danger')
    }
  };

  if(json[19].slot_parkir == "B10"){
    if (json[19].availability == true) {
      b10Elem.setAttribute('class', 'btn btn-success')}
    else {
      b10Elem.setAttribute('class', 'btn btn-danger')
    }
  }; 
};

const updateSlot = async () => {
  let $ = (id) => document.getElementById(id);
  let pilihanElem = $('pilihan');
  let id = pilihanElem.value 

  await fetch(`https://smartparking-reksti.herokuapp.com/parkiran/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"availability": false})
  })
  let urlPart = window.location.href.split('/');
  window.location = urlPart.splice(0, urlPart.length-1).join('/') + '/suksesparkir.html';
};
