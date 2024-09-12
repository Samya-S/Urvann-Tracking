"use client";
import React, { useEffect, useState } from 'react';
import Styles from './AllOrders.module.css';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate } from '@/server/auth-actions';
import { checkAuth } from '@/redux/features/auth';
import { fetchOrders } from '@/server/order-actions';
import Image from 'next/image';
import { FaChevronRight as NextIcon } from 'react-icons/fa';

const parseOrderDate = (date) => {
  const parsedDate = new Date(date);

  // Sun, 25 Jul
  return parsedDate.toDateString().slice(0, 3) + ', ' + parsedDate.getDate() + ' ' + parsedDate.toDateString().slice(4, 7);

  // const day = parsedDate.getDate().toString().padStart(2, '0');
  // const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  // const year = parsedDate.getFullYear();

  // return `${day}/${month}/${year}`;
};

const Orders = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.userToken);
  const [ordersDeliveredData, setOrdersDeliveredData] = useState([]);
  const [ordersPendingData, setOrdersPendingData] = useState([]);
  const [view, setView] = useState('pending'); // State to toggle between 'pending' and 'delivered'

  if (!isAuthenticated) {
    router.push('/login');
  }

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const getOrders = async () => {
    const user = await authenticate(token);

    if (user.success) {
      const { email, phone } = user.data;
      const response = await fetchOrders(email, phone);

      if (response.success) {
        setOrdersPendingData(response.orders.filter(order => order.status !== 'Delivered'));
        setOrdersDeliveredData(response.orders.filter(order => order.status === 'Delivered'));
      } else {
        console.error(response.message);
      }
    } else {
      console.error(user.message);
    }
  }

  useEffect(() => {
    getOrders();
    /* eslint-disable-next-line */
  }, []);

  return (
    <div className={Styles.ordersContainer}>
      <h2 className={Styles.header}>All Orders</h2>

      <div className={Styles.navButtons}>
        <button
          className={`${Styles.navButton} ${view === 'pending' ? Styles.active : ''}`}
          onClick={() => setView('pending')}
        >
          Pending Orders
        </button>
        <button
          className={`${Styles.navButton} ${view === 'delivered' ? Styles.active : ''}`}
          onClick={() => setView('delivered')}
        >
          Delivered Orders
        </button>
      </div>

      {view === 'pending' ? (ordersPendingData.length > 0 ?
        <>
          {ordersPendingData.map((order) => (
            <div
              key={order.orderNumber}
              className={Styles.individualOrder}
              onClick={() => router.push(`/orders/${order.orderNumber}`)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5 min-w-72'>
                  <Image src={order.imgURL} height={500} width={500} alt={order.product} className={Styles.productImage} />
                  <div>
                    <p className='font-semibold text-lg'>{order.product}</p>
                    <p className='text-sm'>Order placed on {parseOrderDate(order.date)}</p>
                    <p className={Styles[`status${order.status.replace(' ', '')}`]}>{order.status}</p>
                  </div>
                </div>
                <div>
                  <NextIcon />
                </div>
              </div>
            </div>
          ))}
        </> : <>
          <p className='text-center'>No orders found</p>
        </>
      ) : (ordersDeliveredData.length > 0 ?
        <>
          {ordersDeliveredData.map((order) => (
            <div
              key={order.orderNumber}
              className={Styles.individualOrder}
              onClick={() => router.push(`/orders/${order.orderNumber}`)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5 min-w-72'>
                  <Image src={order.imgURL} height={500} width={500} alt={order.product} className={Styles.productImage} />
                  <div>
                    <p className='font-semibold text-lg'>{order.product}</p>
                    <p className='text-sm'>Order placed on {parseOrderDate(order.date)}</p>
                    <p className={Styles[`status${order.status.replace(' ', '')}`]}>{order.status}</p>
                  </div>
                </div>
                <div>
                  <NextIcon />
                </div>
              </div>
            </div>
          ))}
        </> : <>
          <p className='text-center'>No orders found</p>
        </>
      )}
    </div>
  );
};

export default Orders;
