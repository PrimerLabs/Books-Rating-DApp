import React, { useState } from "react";
import star from "./star.png";
import { getTxId } from "./utils";
import "./styles.css";

export default function BookRatingApp({ wallet, isSignedIn, contractId }) {
  const [selected, setSelected] = useState(null);
  const [bookshelf, setBookshelf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  // Fetch books when the component mounts
  React.useEffect(() => {
    get_books().then(setBookshelf).then(setLoading(false));
  }, []);

  // View method to fetch the stored count
  const get_books = () =>
    wallet
      .viewMethod({ method: "list_shelf", contractId })
      .then(JSON.parse)
      .then(Object.values);

  const rate_book_method = (id, rating) => {
    return wallet
      .callMethod({
        method: "add_rating",
        args: { id, rating: parseInt(rating, 10) },
        contractId
      })
      .then((res) => getTxId(res))
      .then(async (txId) => await wallet.getTransactionResult(txId))
      .then((res) => setResponse({ type: "success", message: res }))
      .catch((err) => {
        console.error(err);
        setResponse({
          type: "error",
          message: "Something went wrong. Check browser console."
        });
      });
  };

  const rate_books = (id, rating) => {
    setLoading(true);
    setResponse(null);
    rate_book_method(id, rating)
      .then(async () => {
        return get_books();
      })
      .then(setBookshelf)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="DApp">
      <h1>Book Rating DApp</h1>
      {response !== null && (
        <h2
          style={{
            color: response.type === "success" ? "darkgreen" : "indianred"
          }}
        >
          {JSON.stringify(response.message)}
        </h2>
      )}
      <h3 style={{ color: "indianred" }}>
        {loading ? "Fetching Data..." : ""}
      </h3>
      <UserSignIn
        contractId={contractId}
        wallet={wallet}
        isSignedIn={isSignedIn}
      />
      <div className="BookRatingApp">
        <div>
          {bookshelf.length !== 0 &&
            bookshelf.map((book, idx) => (
              <BookRating
                rate_books={rate_books}
                setSelected={setSelected}
                selected={selected}
                loading={loading}
                isSignedIn={isSignedIn}
                key={idx}
                id={idx + 1}
                {...book}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

const UserSignIn = ({ isSignedIn, wallet, contractId }) => {
  if (isSignedIn) {
    return (
      <div>
        Signed In as <b>{wallet.accountId}</b>
        <br />
        <button onClick={() => wallet.signOut()} className="rating-button">
          Sign Out
        </button>
      </div>
    );
  } else {
    return (
      <button onClick={() => wallet.signIn()} className="rating-button">
        Sign In
      </button>
    );
  }
};

const BookRating = ({
  id,
  name,
  rating,
  reviewers,
  selected,
  setSelected,
  rate_books,
  loading,
  isSignedIn
}) => {
  const [user_rating, setUserRating] = React.useState(3);

  return (
    <div
      className="BookItem"
      data-selected={selected === id}
      onClick={() => setSelected(id)}
    >
      <div className="BookHeaderContainer">
        <h1>
          {id}. {name}{" "}
        </h1>
        <div className="BookItemDetail">
          <span>Average Rating</span>: <b>{rating}</b>
          <br />
          <span>Reviewers</span>: <b>{reviewers.length}</b>
        </div>
      </div>
      <div className="BookReviewers" data-selected={selected === id}>
        <Reviewers reviewers={reviewers} name={name} />
        <div className="BookRatingPanel">
          <GetStars stars={user_rating} />

          <input
            className="ratings-slider"
            id="rating"
            type="range"
            min="1"
            max="5"
            step="1"
            value={user_rating}
            onChange={(evt) => setUserRating(evt.target.value)}
          />
          {isSignedIn && (
            <button
              data-loading={loading}
              onClick={() => rate_books(id, user_rating)}
              className="rating-button"
            >
              Rate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Reviewers = ({ reviewers, name }) => {
  if (reviewers.length) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        {reviewers.map((x, idx) => (
          <div
            key={idx}
            style={{
              textAlign: "center",
              margin: "10px"
            }}
          >
            <span>
              <b>{x[0]}</b> rated <b>{x[1]} stars</b>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        margin: "10px",
        display: "flex",
        alignItems: "center"
      }}
    >
      No reviews for <b>&nbsp;{name}</b>
    </div>
  );
};

const GetStars = ({ stars }) => {
  const stars_list = Array.from(
    { length: parseInt(stars, 10) },
    (_, i) => i + 1
  );
  return (
    <div className="StarsView">
      <div>
        {stars_list.map((_, idx) => (
          <img className="starImage" key={idx} src={star} alt="star" />
        ))}
      </div>
      <b>
        {stars} {stars === "1" ? "star" : "stars"}
      </b>
    </div>
  );
};
