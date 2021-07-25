import React, { Component, useEffect, useState } from "react";
import "./Media.css";
import CanvasJSReact from "../../assets/canvasjs.react";
import { db } from "../../firebase";
import NewMapPhoto from "../../media/conquer2.jpg";
import MemeImage from "../../media/DominoMemes/meme4.jpeg";

function Media() {
  const [latestWinners, setLatestWinners] = useState(null);

  useEffect(() => {
    db.collection("Winners")
      .orderBy("Date")
      .limit(3)
      .get()
      .then((querySnapshot) => {
        var winners = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          winners.push(doc.data());
        });
        setLatestWinners(winners);
      })
      .catch((error) => {
        console.log("Error getting winners: ", error);
      });
  }, []);

  return (
    <div className="media">
      <div className="media-title">
        <h1 className="text-yellow-400 font-bold text-5xl p-16">
          {" "}
          Conquer 2.0 Propaganda Hub
        </h1>
      </div>
      <div className="xl:grid grid-cols-3 grid-gap-4">
        <div className="col-span-2 col-start-1 p-4">
          <div className="flex flex-row">
            <img
              src={NewMapPhoto}
              className="object-cover rounded-2xl"
              title="The World Map For Conquer"
              alt="New Map"
            />
          </div>
        </div>
        <div className="col-span-1 col-start-3 p-4">
          <h6 className="text-2xl font-bold">Latest Victors</h6>
          <hr className="p-2" />
          <table cellSpacing="5">
            {latestWinners &&
              latestWinners.map((game) => (
                <WinnerEntry
                  gameid={game.gameId}
                  first={game.first}
                  second={game.second}
                  third={game.third}
                />
              ))}
            <br />
          </table>
        </div>
        <div className="col-span-1 col-start-1 p-4">
          <img
            src={MemeImage}
            className="rounded-xl"
            title="Proudly created by Domino Memes"
          />
        </div>
        <div className="col-span-1 col-start-2 p-4">
          <iframe
            src="https://www.youtube.com/embed/5YRbeA31W-M"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen
            className="object-fit h-full w-full rounded-xl"
          />
        </div>
        <div className="col-span-1 col-start-3 w-full h-full p-4">
          <Graph />
        </div>
      </div>
    </div>
  );
}

const WinnerEntry = ({ gameid, first, second, third }) => {
  return (
    <div>
      <tr>
        <th>
          <p className="text-xl font-bold">Game ID: {gameid}</p>
        </th>
      </tr>
      <tr>
        <td>
          <i className="fas fa-medal text-3xl" style={{ color: "#ffdf00" }} />
        </td>
        <td className="italic"> {first} </td>
      </tr>
      <tr>
        <td>
          <i className="fas fa-medal text-3xl" style={{ color: "#a7a7ad" }} />
        </td>
        <td className="italic"> {second} </td>
      </tr>
      <tr>
        <td>
          <i className="fas fa-medal text-3xl" style={{ color: "#824A02" }} />
        </td>
        <td className="italic"> {third} </td>
      </tr>
      <br />
    </div>
  );
};

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

class Graph extends Component {
  render() {
    const options = {
      theme: "dark2",
      animationEnabled: true,
      exportFileName: "Favourite Stronghold Continents",
      exportEnabled: false,
      title: {
        text: "Favourite Stronghold Continents",
      },
      data: [
        {
          type: "pie",
          showInLegend: false,
          legendText: "{label}",
          toolTipContent: "{label}: <strong>{y}%</strong>",
          indexLabel: "{y}%",
          indexLabelPlacement: "inside",
          dataPoints: [
            { y: 32, label: "Africa" },
            { y: 22, label: "South America" },
            { y: 15, label: "Oceania" },
            { y: 19, label: "Antarctica" },
            { y: 5, label: "North America" },
            { y: 7, label: "Europe" },
            { y: 7, label: "Asia" },
          ],
        },
      ],
    };

    return (
      <div className="p-4 bg-yellow-600">
        <CanvasJSChart
          options={options}
          /* onRef={ref => tdis.chart = ref} */
        />
        {/*You can get reference to tde chart instance as shown above using onRef. tdis allows you to access all chart properties and metdods*/}
      </div>
    );
  }
}

export default Media;
