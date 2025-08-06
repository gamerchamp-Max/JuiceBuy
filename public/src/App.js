import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

const api = 'http://localhost:4000';

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => navigate('/buy')}>Buy</button>
    </div>
  );
}

function Buy() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>What do you want to buy?</h1>
      <button onClick={() => navigate('/orange-juice')}>Orange Juice</button>
    </div>
  );
}

function OrangeJuice() {
  const navigate = useNavigate();
  const [hasFibers, setHasFibers] = useState(null);
  return (
    <div>
      <h1>Orange Juice: Choose Option</h1>
      <button onClick={() => { setHasFibers(true); navigate('/add-on', { state: { hasFibers: true } })}}>With Fibers</button>
      <button onClick={() => { setHasFibers(false); navigate('/add-on', { state: { hasFibers: false } })}}>Without Fibers</button>
    </div>
  );
}

function AddOn({ location, ...props }) {
  const navigate = useNavigate();
  const hasFibers = window.history.state?.usr?.hasFibers;
  return (
    <div>
      <h1>Add-on?</h1>
      <button onClick={() => navigate('/queue', { state: { hasFibers, addOn: true } })}>Add-on</button>
      <button onClick={() => navigate('/queue', { state: { hasFibers, addOn: false } })}>No</button>
    </div>
  );
}

function Korosha() {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <div style={{ background: '#ffa500', width: 30, height: 30 }}></div>
      <div style={{ background: '#ffa500', width: 30, height: 30 }}></div>
      <div style={{ background: '#ffa500', width: 30, height: 30 }}></div>
    </div>
  );
}

function Queue() {
  const navigate = useNavigate();
  const state = window.history.state?.usr || {};
  const [orders, setOrders] = useState([]);
  const [myOrder, setMyOrder] = useState(null);

  React.useEffect(() => {
    let orderSent = false;
    if (state.hasFibers !== undefined && state.addOn !== undefined && !orderSent) {
      fetch(`${api}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juiceType: 'Orange Juice',
          hasFibers: state.hasFibers,
          addOn: state.addOn
        })
      })
        .then(res => res.json())
        .then(order => {
          setMyOrder(order);
          orderSent = true;
        });
    }
    const interval = setInterval(() => {
      fetch(`${api}/queue`)
        .then(res => res.json())
        .then(setOrders);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  return (
    <div>
      <h1>Queue</h1>
      <p>Your Order Number: {myOrder?.number}</p>
      <p>Order: {myOrder && `${myOrder.juiceType} - ${myOrder.hasFibers ? "With Fibers" : "No Fibers"}${myOrder.addOn ? " + Add-on" : ""}`}</p>
      {myOrder?.addOn && <Korosha />}
      <h2>All Orders:</h2>
      <ol>
        {orders.map(order => (
          <li key={order.number}>
            #{order.number}: {order.juiceType} - {order.hasFibers ? "With Fibers" : "No Fibers"}{order.addOn ? " + Add-on" : ""}
            {order.addOn && <Korosha />}
          </li>
        ))}
      </ol>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/orange-juice" element={<OrangeJuice />} />
        <Route path="/add-on" element={<AddOn />} />
        <Route path="/queue" element={<Queue />} />
      </Routes>
    </BrowserRouter>
  );
}