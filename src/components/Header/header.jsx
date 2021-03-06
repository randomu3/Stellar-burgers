import React from "react";

import {
  Logo,
  BurgerIcon,
  ProfileIcon,
  ListIcon,
} from "@ya.praktikum/react-developer-burger-ui-components";

import headerStyles from "./header.module.css";

const ButtonConstructor = () => {
  return (
    <button
      className={`pt-4 pb-4 pr-5 pl-5 text text_type_main-default ${headerStyles.button_active} ${headerStyles.button}`}
    >
      <div className={`mr-2 ${headerStyles.constructor}`}>
        <BurgerIcon type="primary" />
      </div>
      Конструктор
    </button>
  );
};

const ListOrders = () => {
  return (
    <button
      className={`ml-2 pt-4 pb-4 pr-5 pl-5 text text_type_main-default text_color_inactive ${headerStyles.button} ${headerStyles.list}`}
    >
      <div className={`mr-2 ${headerStyles.list_orders}`}>
        <ListIcon type="secondary" />
      </div>
      Лента заказов
    </button>
  );
};

const PersonalAccount = () => {
  return (
    <button
      className={`pt-4 pb-4 pr-5 pl-5 text text_type_main-default text_color_inactive ${headerStyles.button}`}
    >
      <div className={`mr-2 ${headerStyles.personal_account_icon}`}>
        <ProfileIcon type="secondary" />
      </div>
      Личный кабинет
    </button>
  );
};

export const AppHeader = () => {
  return (
    <header className={headerStyles.header_semantic}>
      <div className={`p-4 ${headerStyles.header}`}>
        <div className={headerStyles.header_left_bar}>
          <ButtonConstructor />
          <ListOrders />
          <Logo />
        </div>
        <PersonalAccount />
      </div>
    </header>
  );
};
