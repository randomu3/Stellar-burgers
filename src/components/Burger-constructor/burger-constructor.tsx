import React, { useState, useCallback, useMemo, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import bcStyles from "./burger-constructor.module.css";
import {
  Button,
  CurrencyIcon,
  ConstructorElement,
  DragIcon,
} from "@ya.praktikum/react-developer-burger-ui-components";
import { OrderDetails } from "../Order-details/order-details";
import {
  addBun,
  addFilling,
  delFilling,
  moveFilling,
} from "../../services/actions/constructor";
import { postOrder } from "../../services/actions";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { TItem } from "../../services/types/data";

const ComponentsList = () => {
  const orders = useAppSelector((state) => state.ingredientsConstructor);

  const dispatch = useAppDispatch();
  // eslint-disable-next-line no-empty-pattern, no-unused-vars, @typescript-eslint/no-unused-vars
  const [_, drop] = useDrop(() => ({
    accept: "ingredient",
    drop: (item: TItem) => {
      if (item.type === "bun") {
        return dispatch(addBun(item));
      }
      dispatch(addFilling({ ...item, id: Date.now() }));
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const deleteFilling = useCallback(
    (id: number) => {
      dispatch(delFilling(id));
    },
    [dispatch]
  );

  return (
    <div className={bcStyles.constructor_wrapper} ref={drop}>
      {orders.bun && (
        <ConstructorElement
          type="top"
          isLocked={true}
          text={`${orders.bun.name} (верх)`}
          price={orders.bun.price}
          thumbnail={orders.bun.image}
        />
      )}
      <ul className={`${bcStyles.ul}`}>
        {orders.fillings.map((ingredient, index) => (
          <Filling
            index={index}
            key={ingredient.id}
            ingredient={ingredient}
            deleteFilling={deleteFilling}
          />
        ))}
      </ul>
      {orders.bun && (
        <ConstructorElement
          type="bottom"
          isLocked={true}
          text={`${orders.bun.name} (низ)`}
          price={orders.bun.price}
          thumbnail={orders.bun.image}
        />
      )}
    </div>
  );
};

interface IFIllingProps {
  ingredient: TItem;
  deleteFilling: (id: number) => void;
  index: number;
}

const Filling: React.FC<IFIllingProps> = ({
  ingredient,
  deleteFilling,
  index,
}) => {
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const [, drop] = useDrop({
    accept: "filling",
    hover(item: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      dispatch(
        moveFilling({
          dragIndex,
          hoverIndex,
        })
      );
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "filling",
    item: { ingredient, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 0.999;
  drag(drop(ref));

  return (
    <li ref={ref} className={bcStyles.li} style={{ opacity }}>
      <DragIcon type="primary" />
      <ConstructorElement
        text={ingredient.name}
        price={ingredient.price}
        thumbnail={ingredient.image}
        handleClose={() => deleteFilling(ingredient.id)}
      />
    </li>
  );
};

const ButtonOrder = () => {
  const [isShow, setShow] = useState(false);
  const orders = useAppSelector((state) => state.ingredientsConstructor);
  const { isAuthorized } = useAppSelector((state) => state.auth);
  const isLoading = useAppSelector((state) => state.postOrder.dataRequest);
  const dispatch = useAppDispatch();
  const history = useHistory();

  function openModal() {
    if (!isAuthorized) {
      history.replace("/login");
      return;
    }

    setShow(true);
    let idOrdersArray = orders.fillings.map((ingredient) => ingredient._id);
    if (orders.bun?._id) {
      idOrdersArray.push(orders.bun._id, orders.bun._id);
    }

    dispatch(postOrder(idOrdersArray)); // ts
  }

  const closeModal = useCallback(() => {
    !isLoading && setShow(false);
  }, [isLoading]);

  const memoizedValue = useMemo(
    () =>
      orders.fillings.reduce(
        (previousValue, currentValue) => previousValue + currentValue.price,
        (orders.bun?.price || 0) * 2
      ),
    [orders] // То что влияет на изменение
  );

  return (
    <>
      {isShow && <OrderDetails isLoading={isLoading} closeModal={closeModal} />}
      <div className={`${bcStyles.button_section}`}>
        <div className={`${bcStyles.button}`}>
          <p className={`text text_type_digits-medium mr-2`}>
            {memoizedValue || 0}
          </p>
          <CurrencyIcon type="primary" />
        </div>
        <Button type="primary" size="large" onClick={openModal}>
          Оформить заказ
        </Button>
      </div>
    </>
  );
};

export const BurgerConstructor = () => {
  return (
    <div className={`${bcStyles.constructor} ml-4`}>
      <ComponentsList />
      <ButtonOrder />
    </div>
  );
};
