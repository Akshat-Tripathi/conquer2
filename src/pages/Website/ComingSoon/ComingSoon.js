import React from 'react';
import Preloader from './Preloader/Preloader';
import Timer from './Timer/Timer';
import Header from '../Header';
import Footer from '../Footer';

function ComingSoon() {
    return (
      <div className="">
        <Header className=""/>
        <div className="bg-black max-h-full p-16">
          <h1 className="text-center">
            Coming Soon
          </h1>
          <Timer />
          <Preloader />
        </div>
        <Footer/>
      </div>
    );
}

export default ComingSoon;