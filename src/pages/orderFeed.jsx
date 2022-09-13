import { CurrencyIcon } from "@ya.praktikum/react-developer-burger-ui-components";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useHistory, useLocation } from "react-router-dom";
import { logout } from "../services/actions/auth";
import { data } from "../components/utils/data";
import { ru } from "date-fns/locale";
import PropTypes from "prop-types";

import styles from "./page.module.css";
import { setInfoIngredient } from "../services/actions/currentIngredient";
import {
  WS_CLEAR_ORDERS,
  WS_CONNECTION_START,
} from "../services/actions/wsActionTypes";
import { getCookie } from "../components/utils/cookie";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

export function OrdersFeed() {
  const dispatch = useDispatch();
  const onClickLogout = (e) => {
    e.preventDefault();
    dispatch(logout);
  };
  const history = useHistory();
  let location = useLocation();

  const orders = useSelector((state) => state.ws.orders);
  console.log("orders", orders);

  useEffect(() => {
    dispatch({ type: WS_CLEAR_ORDERS });
    dispatch({
      type: WS_CONNECTION_START,
      payload: `wss://norma.nomoreparties.space/orders?token=${
        getCookie("accessToken").split(" ")[1]
      }`,
    });
  }, [dispatch]);

  function openModal(data) {
    dispatch(setInfoIngredient(data)); // ?? change dispatch
  }

  return (
    <div className={styles.profile_wrapper}>
      <div className={styles.profile_links}>
        <nav>
          <NavLink
            to="/profile"
            exact
            activeClassName={styles.link_active}
            className={`text text_type_main-medium ${styles.link}`}
          >
            Профиль
          </NavLink>
          <NavLink
            to="/profile/orders"
            exact
            activeClassName={styles.link_active}
            className={`text text_type_main-medium ${styles.link}`}
          >
            История заказов
          </NavLink>
          <Link
            to="/login"
            onClick={onClickLogout}
            className={`text text_type_main-medium ${styles.link}`}
          >
            Выход
          </Link>
        </nav>
        <span className={`text text_type_main-default ${styles.description}`}>
          В этом разделе вы можете просмотреть свою историю заказов
        </span>
      </div>
      <div className={styles.feed}>
        <ul className={styles.orders_list}>
          {orders.reverse().map((order, index) => (
            <OrderItem
              order={order}
              key={index}
              onClick={() => {
                openModal(order);
                history.push({
                  pathname: `/profile/orders/${order._id}`,
                  state: { background: location },
                });
              }}
            ></OrderItem>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OrderItem({ order, onClick }) {
  const { ingredients } = useSelector((state) => state.ingredients);
  let stringOfDate = "";

  if (isToday(Date.parse(order.createdAt))) {
    stringOfDate = "Сегодня, ";
  } else if (isYesterday(Date.parse(order.createdAt))) {
    stringOfDate = "Вчера, ";
  } else {
    stringOfDate =
      formatDistanceToNow(Date.parse(order.createdAt), {
        locale: ru,
      }) + " назад, ";
  }

  stringOfDate += format(Date.parse(order.createdAt), "HH:mm zzz");

  const sumPrice = React.useMemo(() => {
    return order.ingredients.reduce((previousValue, currentValue) => {
      const ingredient = ingredients.find((e) => e._id === currentValue);
      let sumPrice = previousValue + ingredient.price;
      return sumPrice;
    }, 0);
  }, [ingredients, order.ingredients]);

  return (
    <li className={styles.order} onClick={onClick}>
      <div className={styles.order_n_orderDate}>
        <span className="text text_type_digits-default">#{order.number}</span>
        <span className="text text_type_main-default text_color_inactive">
          {stringOfDate}
        </span>
      </div>
      <h3 className="text text_type_main-medium">{order.name}</h3>
      <div className={styles.list_n_price}>
        <ul className={styles.list}>
          {data.length > 6 ? (
            <IngredientsMoreSix data={order.ingredients} />
          ) : (
            <IngredientsLessSix data={order.ingredients} />
          )}
        </ul>
        <div className={styles.price}>
          <span className="text text_type_digits-default">{sumPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </li>
  );
}

function IngredientsMoreSix({ data }) {
  const { ingredients } = useSelector((state) => state.ingredients);
  return (
    <>
      {data.slice(0, 6).map((item, index) => (
        <li key={index} className={styles.list_item}>
          {index + 1 === 6 ? (
            <img
              style={{ opacity: 0.6 }}
              className={styles.item_screen}
              src={ingredients.find((e) => e._id === item).image_mobile}
              alt={ingredients.find((e) => e._id === item).name}
            />
          ) : (
            <img
              className={styles.item_screen}
              src={ingredients.find((e) => e._id === item).image_mobile}
              alt={ingredients.find((e) => e._id === item).name}
            />
          )}
          {index + 1 === 6 ? (
            <span className={`text text_type_main-default ${styles.quantity}`}>
              +{data.length - 5}
            </span>
          ) : null}
        </li>
      ))}
    </>
  );
}

function IngredientsLessSix({ data }) {
  const { ingredients } = useSelector((state) => state.ingredients);
  return (
    <>
      {data.map((item, index) => (
        <li key={index} className={styles.list_item}>
          <img
            style={{ opacity: 0.6 }}
            className={styles.item_screen}
            src={ingredients.find((e) => e._id === item).image_mobile}
            alt={ingredients.find((e) => e._id === item).name}
          />
        </li>
      ))}
    </>
  );
}

OrderItem.propTypes = {
  IngredientsLessSix: PropTypes.object,
  IngredientsMoreSix: PropTypes.object,
  order: PropTypes.object?.isRequired,
  onClick: PropTypes.func.isRequired,
};
