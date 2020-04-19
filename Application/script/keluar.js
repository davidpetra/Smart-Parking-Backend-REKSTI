const keluar = async () => {


 	let $ = (id) => document.getElementById(id);
 	let tiketElem = $('tiket');
  let parkirElem = $('parkir');
	let id = tiketElem.value ;
  let parkir = parkirElem.value;

 	await fetch(`https://smartparking-reksti.herokuapp.com/tiket/${id}`, {
		method: 'PUT',
		headers: {
      	'Content-Type': 'application/json'
    	},
  	})

  await fetch(`https://smartparking-reksti.herokuapp.com/parkiran/${parkir}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"availability": true})
  })

	await fetch(`https://smartparking-reksti.herokuapp.com/pembayaran`, {
    method: 'POST',
    mode:'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"id_tiket": id, 
	  })

  	})

	.then((response)=> {
    	return response.json();
    	console.log(response);
  	})
  	.then((data)=>{
	    console.log(data);
	    window.localStorage.setItem('id_bayar', data.result.id_bayar);
  	})
	let urlPart = window.location.href.split('/');
	window.location = urlPart.splice(0, urlPart.length-1).join('/') + '/totalbayar.html';

};

const getTotalBayar = async () => {
  let $ = (id) => document.getElementById(id);
  let id = window.localStorage.getItem('id_bayar');
  let result = await fetch(`https://smartparking-reksti.herokuapp.com/pembayaran/${id}`);
  console.log(result);
 // let result = await fetch(`https://smartparking-reksti.herokuapp.com/pembayaran/2`)
  let json = await result.json();
  console.log(json);
  //console.log(json.id_tiket);
  // let item = json[0];
  // console.log(item);

  let tagihanElem = $('tagihan');

  tagihanElem.value = json.total_tagihan;
};


const emoney = async () => {


 // 	let $ = (id) => document.getElementById(id);
 // let tiketElem = $('tiket');
	// let id = tiketElem.value 
	let $ = (id) => document.getElementById(id);
  	let id = window.localStorage.getItem('id_bayar');

 	await fetch(`https://smartparking-reksti.herokuapp.com/pembayaran/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "jenis_pembayaran": "emoney"})
  })


	let urlPart = window.location.href.split('/');
	window.location = urlPart.splice(0, urlPart.length-1).join('/') + '/suksesbayar.html';

}

const cash = async () => {

 // 	let $ = (id) => document.getElementById(id);
 // let tiketElem = $('tiket');
	// let id = tiketElem.value 
	let $ = (id) => document.getElementById(id);
  	let id = window.localStorage.getItem('id_bayar');
  	
 	await fetch(`https://smartparking-reksti.herokuapp.com/pembayaran/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "jenis_pembayaran": "cash"})
  })


	let urlPart = window.location.href.split('/');
	window.location = urlPart.splice(0, urlPart.length-1).join('/') + '/suksesbayar.html';

}
