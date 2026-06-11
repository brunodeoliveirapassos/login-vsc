// purchase.js - lógica da página de compra
(function(){
  // Verifica login: redireciona ao `login.html` se não estiver autenticado
  try {
    const _user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!_user) {
      alert('Você precisa estar logado para acessar a compra de passagens.');
      window.location.href = 'login.html';
      return;
    }
  } catch (err) {
    // em caso de erro no parsing, força logout
    localStorage.removeItem('loggedUser');
    window.location.href = 'login.html';
    return;
  }
  const seatMapEl = document.getElementById('seatMap');
  const selectedSeatEl = document.getElementById('selectedSeat');
  const priceEl = document.getElementById('price');
  const messageEl = document.getElementById('message');
  const confirmBtn = document.getElementById('confirm');

  let selectedSeat = null;
  const prices = { convencional: 50.00, executivo: 85.00 };

  // Gera mapa de poltronas com contagem total (ex: 42)
  // Garante que, se houver apenas 2 poltronas na última linha, elas fiquem alinhadas à esquerda
  function buildSeatMap(totalSeats = 42){
    seatMapEl.innerHTML = '';
    const seatsPerRow = 4; // 2 left + 2 right
    const fullRows = Math.floor(totalSeats / seatsPerRow);
    const remainder = totalSeats % seatsPerRow;
    let seatNumber = 1;

    // linhas completas
    for(let r=0;r<fullRows;r++){
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';
      // left 2
      rowEl.appendChild(makeSeat(String(seatNumber++)));
      rowEl.appendChild(makeSeat(String(seatNumber++)));
      // corredor
      const aisle = document.createElement('div'); aisle.className = 'aisle';
      rowEl.appendChild(aisle);
      // right 2
      rowEl.appendChild(makeSeat(String(seatNumber++)));
      rowEl.appendChild(makeSeat(String(seatNumber++)));
      seatMapEl.appendChild(rowEl);
    }

    // linha final com resto
    if(remainder > 0){
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';
      // coloca até 2 na esquerda
      const leftCount = Math.min(2, remainder);
      for(let i=0;i<leftCount;i++) rowEl.appendChild(makeSeat(String(seatNumber++)));

      // corredor
      const aisle = document.createElement('div'); aisle.className = 'aisle';
      rowEl.appendChild(aisle);

      // coloca o restante na direita
      const rightCount = remainder - leftCount;
      for(let i=0;i<rightCount;i++) rowEl.appendChild(makeSeat(String(seatNumber++)));

      seatMapEl.appendChild(rowEl);
    }
  }

  function makeSeat(id){
    const s = document.createElement('div');
    s.className = 'seat available';
    s.dataset.seat = id;
    s.textContent = id; // mostra número simples
    s.title = 'Poltrona ' + id;
    s.addEventListener('click', onSeatClick);
    return s;
  }

  function onSeatClick(e){
    const el = e.currentTarget;
    if(el.classList.contains('disabled')) return;
    // toggle selection single-seat
    if(selectedSeat && selectedSeat !== el){
      selectedSeat.classList.remove('selected');
      selectedSeat.classList.add('available');
    }

    if(el === selectedSeat){
      selectedSeat = null;
      el.classList.remove('selected');
      el.classList.add('available');
    } else {
      el.classList.remove('available');
      el.classList.add('selected');
      selectedSeat = el;
    }
    updateSummary();
  }

  function updateSummary(){
    const cls = document.querySelector('input[name="busClass"]:checked').value;
    const price = prices[cls];
    document.getElementById('price').textContent = `Preço: R$ ${price.toFixed(2).replace('.',',')}`;
    document.getElementById('selectedSeat').textContent = `Poltrona: ${selectedSeat ? selectedSeat.dataset.seat : '—'}`;
  }

  // Rebuild seat map when class changes (ambas as classes usam 42 lugares agora)
  document.querySelectorAll('input[name="busClass"]').forEach(r=>{
    r.addEventListener('change', ()=>{
      // tanto executivo quanto convencional mostram 42 poltronas
      buildSeatMap(42);
      selectedSeat = null;
      updateSummary();
    });
  });

  confirmBtn.addEventListener('click', ()=>{
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const cls = document.querySelector('input[name="busClass"]:checked').value;

    if(!date || !time){
      showMessage('Informe data e hora da viagem.', 'error');
      return;
    }
    if(!selectedSeat){
      showMessage('Selecione uma poltrona antes de confirmar.', 'error');
      return;
    }

    const booking = {
      id: Date.now(),
      origin, destination, date, time, class: cls, seat: selectedSeat.dataset.seat,
      price: prices[cls]
    };

    // salvar em localStorage (simulação de banco)
    const list = JSON.parse(localStorage.getItem('bookings') || '[]');
    list.push(booking);
    localStorage.setItem('bookings', JSON.stringify(list, null, 2));
    // guardar id da última reserva e redirecionar para página de confirmação
    localStorage.setItem('lastBookingId', booking.id);
    // limpa seleção e redireciona
    if(selectedSeat){ selectedSeat.classList.remove('selected'); selectedSeat = null; }
    updateSummary();
    // redireciona para confirm.html
    window.location.href = 'confirm.html';
  });

  function showMessage(text, type){
    messageEl.textContent = text;
    messageEl.className = 'message ' + (type === 'success' ? 'success' : 'error');
    setTimeout(()=>{ messageEl.textContent=''; messageEl.className='message'; }, 6000);
  }

  // init (padrao: convencional = 42 lugares)
  // se existir seleção prévia de classe no formulário, usa ela
  // inicializa com 42 poltronas para todas as classes
  buildSeatMap(42);
  updateSummary();
})();
