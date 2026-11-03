const $ = id => document.getElementById(id);
let transactions = JSON.parse(localStorage.getItem('paisa_transactions') || '[]');
let editingId = null;
$('date').value = new Date().toISOString().slice(0,10);
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(value);

function saveTransactions(){
  localStorage.setItem('paisa_transactions', JSON.stringify(transactions));
  renderTransactions();
}
function renderTransactions(){
  const income = transactions.filter(t=>t.type==='income').reduce((sum,t)=>sum+t.amount,0);
  const expenses = transactions.filter(t=>t.type==='expense').reduce((sum,t)=>sum+t.amount,0);
  $('incomeTotal').textContent = money(income);
  $('expenseTotal').textContent = money(expenses);
  $('balance').textContent = money(income-expenses);
  $('balance').style.color = income-expenses < 0 ? 'var(--red)' : 'var(--ink)';

  const query = $('search').value.toLowerCase();
  const category = $('categoryFilter').value;
  const type = $('typeFilter').value;
  const visible = transactions.filter(t =>
    (t.title.toLowerCase().includes(query)||t.category.toLowerCase().includes(query)) &&
    (category==='all'||t.category===category) && (type==='all'||t.type===type)
  ).sort((a,b)=>b.date.localeCompare(a.date));

  $('history').innerHTML = '';
  if (!visible.length) {
    $('history').innerHTML = '<div class="empty">No transactions yet. Add your first one.</div>';
    return;
  }
  visible.forEach(t=>{
    const row=document.createElement('div');row.className='item';
    const dot=document.createElement('span');dot.className='dot'+(t.type==='expense'?' out':'');
    const details=document.createElement('div');details.className='details';
    const title=document.createElement('b');title.textContent=t.title;
    const meta=document.createElement('small');meta.textContent=t.category+' · '+t.date;
    details.append(title,meta);
    const value=document.createElement('span');value.className='value '+(t.type==='income'?'in':'out');
    value.textContent=(t.type==='income'?'+':'−')+money(t.amount);
    const edit=document.createElement('button');edit.className='mini';edit.textContent='Edit';edit.onclick=()=>loadEdit(t.id);
    const remove=document.createElement('button');remove.className='mini';remove.textContent='✕';
    remove.onclick=()=>{if(confirm('Delete this transaction?')){transactions=transactions.filter(item=>item.id!==t.id);saveTransactions();}};
    row.append(dot,details,value,edit,remove);$('history').append(row);
  });
}
function resetForm(){
  editingId=null;$('form').reset();$('date').value=new Date().toISOString().slice(0,10);
  $('formTitle').textContent='＋ Add transaction';$('submitBtn').textContent='Add transaction';$('cancel').style.display='none';
}
function loadEdit(id){
  const t=transactions.find(item=>item.id===id);editingId=id;
  $('title').value=t.title;$('amount').value=t.amount;$('type').value=t.type;$('category').value=t.category;$('date').value=t.date;
  $('formTitle').textContent='Edit transaction';$('submitBtn').textContent='Save changes';$('cancel').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}
$('form').addEventListener('submit',event=>{
  event.preventDefault();
  const title=$('title').value.trim(),amount=Number($('amount').value);
  if(!title||!Number.isFinite(amount)||amount<=0){alert('Enter a description and an amount greater than zero.');return;}
  const item={id:editingId||Date.now(),title,amount,type:$('type').value,category:$('category').value,date:$('date').value};
  if(editingId)transactions=transactions.map(t=>t.id===editingId?item:t);else transactions.unshift(item);
  saveTransactions();resetForm();
});
$('cancel').addEventListener('click',resetForm);
['search','categoryFilter','typeFilter'].forEach(id=>$(id).addEventListener('input',renderTransactions));
renderTransactions();