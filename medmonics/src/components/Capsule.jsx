// Loader.js
import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="content">
        <div className="pill">
          <div className="medicine">
            {/* Medicine particles */}
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="side" />
          <div className="side" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .app-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Background with slight opacity */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Ensure it appears above other content */
  }

  .content {
    width: 50vmin;
    height: 50vmin;
    background: #fff0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pill {
    background: #fff0;
    width: 15vmin;
    height: 40vmin;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    transform: rotate(180deg);
    animation: spin 4s linear 0s infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(-540deg);
    }
  }

  .pill .side {
    background: #f7c340;
    position: relative;
    overflow: hidden;
    width: 11vmin;
    height: 15vmin;
    border-radius: 6vmin 6vmin 0 0;
  }

  .pill .side + .side {
    background: #d9680c;
    border-radius: 0 0 6vmin 6vmin;
    border-top: 1vmin solid #621e1a;
    animation: open 2s ease-in-out 0s infinite;
  }

  @keyframes open {
    0%,
    20%,
    80%,
    100% {
      margin-top: 0;
    }
    30%,
    70% {
      margin-top: 10vmin;
    }
  }

  .pill .side:before {
    content: "";
    position: absolute;
    width: 2vmin;
    height: 10vmin;
    bottom: 0;
    right: 1.5vmin;
    background: #fff2;
    border-radius: 1vmin 1vmin 0 0;
    animation: shine 1s ease-out -1s infinite alternate-reverse;
  }

  .pill .side + .side:before {
    bottom: inherit;
    top: 0;
    border-radius: 0 0 1vmin 1vmin;
  }

  .pill .side:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: 0;
    left: 0;
    border-radius: 6vmin 6vmin 0 0;
    border: 1.75vmin solid #00000022;
    border-bottom-color: #fff0;
    border-bottom-width: 0vmin;
    border-top-width: 1vmin;
    animation: shadow 1s ease -1s infinite alternate-reverse;
  }

  .pill .side + .side:after {
    bottom: inherit;
    top: 0;
    border-radius: 0 0 6vmin 6vmin;
    border-top-color: #fff0;
    border-top-width: 0vmin;
    border-bottom-width: 1vmin;
  }

  @keyframes shine {
    0%,
    46% {
      right: 1.5vmin;
    }
    54%,
    100% {
      right: 7.5vmin;
    }
  }

  @keyframes shadow {
    0%,
    49.999% {
      transform: rotateY(0deg);
      left: 0;
    }
    50%,
    100% {
      transform: rotateY(180deg);
      left: -3vmin;
    }
  }

  .medicine {
    position: absolute;
    width: calc(100% - 6vmin);
    height: calc(100% - 12vmin);
    background: #fff0;
    border-radius: 5vmin;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .medicine i {
    width: 1vmin;
    height: 1vmin;
    background: #47c;
    border-radius: 100%;
    position: absolute;
    animation: medicine-dust 1.75s ease 0s infinite alternate;
  }

  @keyframes medicine-dust {
    0%,
    100% {
      transform: translate3d(0vmin, 0vmin, -0.1vmin);
    }
    25% {
      transform: translate3d(0.25vmin, 5vmin, 0vmin);
    }
    75% {
      transform: translate3d(-0.1vmin, -4vmin, 0.25vmin);
    }
  }
`;

export default Loader;
