// confirm.js - carrega a última reserva e gera QR code (via Google Chart API)
(function(){
  const noBooking = document.getElementById('noBooking');
  const bookingCard = document.getElementById('bookingCard');
  const bOrigin = document.getElementById('bOrigin');
  const bDestination = document.getElementById('bDestination');
  const bDate = document.getElementById('bDate');
  const bTime = document.getElementById('bTime');
  const bClass = document.getElementById('bClass');
  const bSeat = document.getElementById('bSeat');
  const bPrice = document.getElementById('bPrice');
  const qrImg = document.getElementById('qrImg');
  const printBtn = document.getElementById('printBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const lastId = localStorage.getItem('lastBookingId');
  let booking = null;

  if(lastId){
    booking = bookings.find(b=>String(b.id) === String(lastId));
  }
  if(!booking && bookings.length) booking = bookings[bookings.length-1];

  if(!booking){
    noBooking.hidden = false;
    bookingCard.hidden = true;
    return;
  }

  noBooking.hidden = true;
  bookingCard.hidden = false;

  bOrigin.textContent = booking.origin;
  bDestination.textContent = booking.destination;
  bDate.textContent = booking.date;
  bTime.textContent = booking.time;
  bClass.textContent = booking.class;
  bSeat.textContent = booking.seat;
  bPrice.textContent = booking.price.toFixed(2).replace('.',',');

  // Gera QR encodeando os dados mínimos (id, origin, destination, date, seat)
  const qrPayload = JSON.stringify({ id: booking.id, origin: booking.origin, destination: booking.destination, date: booking.date, time: booking.time, seat: booking.seat });
  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(qrPayload)}`;
  qrImg.src = qrUrl;

  // elementos para incorporação
  const embedBtn = document.getElementById('embedBtn');
  const embedArea = document.getElementById('embedArea');
  const embedCode = document.getElementById('embedCode');
  const copyEmbed = document.getElementById('copyEmbed');
  const closeEmbed = document.getElementById('closeEmbed');

  // função que tenta converter a imagem remota em dataURL
  function fetchAsDataUrl(url){
    return fetch(url, {mode: 'cors'}).then(r=>{
      if(!r.ok) throw new Error('Falha ao buscar QR');
      return r.blob();
    }).then(blob=>new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onloadend = ()=>resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
  }

  embedBtn.addEventListener('click', ()=>{
    embedArea.hidden = false;
    embedCode.value = 'Gerando código...';
    // tenta gerar data URL; se falhar, oferece o código com URL direto
    fetchAsDataUrl(qrUrl).then(dataUrl=>{
      const html = `<img src="${dataUrl}" alt="QR da reserva">`;
      embedCode.value = html;
    }).catch(()=>{
      const html = `<img src="${qrUrl}" alt="QR da reserva">`;
      embedCode.value = html + '\n<!-- Se quiser offline, salve a imagem e substitua src pelo caminho local -->';
    });
  });

  copyEmbed.addEventListener('click', ()=>{
    const text = embedCode.value;
    if(!text) return;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(()=>{ alert('Código copiado para a área de transferência.'); });
    } else {
      embedCode.select();
      document.execCommand('copy');
      alert('Código copiado para a área de transferência.');
    }
  });

  closeEmbed.addEventListener('click', ()=>{ embedArea.hidden = true; });

  printBtn.addEventListener('click', ()=>{
    // abrir janela de impressão simples
    window.print();
  });

  downloadBtn.addEventListener('click', ()=>{
    // abrir imagem QR em nova aba para salvar
    window.open(qrUrl, '_blank');
  });
})();
