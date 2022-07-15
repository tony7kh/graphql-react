// import FetchFullContent from './FetchFullContent'
import "./App.css";
import React, { useState } from "react";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider, connect } from "react-redux";
// import { gql, useQuery } from '@apollo/client'

function promiseReducer(state, { type, status, name, payload, error }) {
  if (state === undefined) {
    return {};
  }

  if (type === "PROMISE") {
    return {
      ...state,
      [name]: { status, payload, error },
    };
  }
  return state;
}

const store = createStore(promiseReducer, applyMiddleware(thunk));

let gql = async (url, query, variables) => {
  let res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
};

const IphoneGoods = gql(
  "http://shop-roles.node.ed.asmer.org.ua/graphql",
  `query iphones($q:String){
                            CategoryFind(query:$q){
                              _id 
                              name 
                              goods{
                                name,
                                description,
                                images{
                                  url
                                }
                                price
                              }
                            }
                          }`,
  { q: JSON.stringify([{ name: "iPhone" }]) }
);

const SamsungGoods = gql(
  "http://shop-roles.node.ed.asmer.org.ua/graphql",
  `query samsung($q:String){
                            CategoryFind(query:$q){
                              _id 
                              name 
                              goods{
                                name,
                                description,
                                images{
                                  url
                                }
                                price
                              }
                            }
                          }`,
  { q: JSON.stringify([{ name: "Samsung" }]) }
);

const actionPending = (name) => ({ type: "PROMISE", status: "PENDING", name });
const actionFulfilled = (name, payload) => ({
  type: "PROMISE",
  status: "FULFILLED",
  name,
  payload,
});
const actionRejected = (name, error) => ({
  type: "PROMISE",
  status: "REJECTED",
  name,
  error,
});

const actionPromise = (name, promise) => async (dispatch) => {
  dispatch(actionPending(name));
  try {
    let payload = await promise;
    console.log(payload);
    dispatch(actionFulfilled(name, payload));
    return payload;
  } catch (err) {
    dispatch(actionRejected(name, err));
  }
};

// const url = 'https://shop-items-server.herokuapp.com/'
// store.dispatch(actionPromise('FetchSecondContent', fetch(url).then(res => res.json())))

store.dispatch(actionPromise("IphoneGoods", IphoneGoods));
store.dispatch(actionPromise("SamsungGoods", SamsungGoods));

const DataFromPromise = ({ status, payload, error }) => {
  console.log({ status, payload, error });
  return (
    <div className="wrapper">
      <div className="content">
        {status === "PENDING" && (
          <>
            <b>Loading. Please, wait...</b>
          </>
        )}
        {status === "REJECTED" && (
          <>
            <b>ERROR</b>: {error}
          </>
        )}
        {status === "FULFILLED" && (
          <>
            <h2>
              <b>Category:</b> {payload.data.CategoryFind[0].name}
            </h2>
            <ul className="list-items">
              {payload.data.CategoryFind[0].goods.map((smartphone) => (
                <li className="list-items__item" key={smartphone._id}>
                  <h3>{smartphone.name}</h3>
                  <p>
                    <b> Price: </b>
                    {smartphone.price}
                  </p>
                  {/* <img src='http://shop-roles.node.ed.asmer.org.ua/'/> */}
                  <p>
                    <b> Description: </b>
                    {smartphone.description}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

const CApple = connect((state) => state.IphoneGoods || {})(DataFromPromise);
const CSamsung = connect((state) => state.SamsungGoods || {})(DataFromPromise);

console.log(store.getState().GoodsByCatId);

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <CSamsung />
        <CApple />
      </div>
    </Provider>
  );
}

export default App;
