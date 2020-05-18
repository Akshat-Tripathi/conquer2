//Make this awesome pls
class App extends React.Component {
    render() {
      return (
        <div className="container">
          <div className="col-xs-8 col-xs-offset-2 jumbotron text-center">
            <h1>Conquer 2</h1>
            <p>The best game you've ever played</p>
            <p>Enter a username and password</p>

            <form action = "/" method="POST">
                <div><input type="text" placeholder="Username" name = "username" required></input></div>
                <div><input type ="password" placeholder="Password" name = "password" required></input></div>
                <div><input type="text" placeholder="Game Id" name = "id"></input></div>
                <input type="submit" name="submit" value="join"></input>
            </form>

            <form action = "/" method="POST">
                <select name="type" required>
                    <option value="realtime">Realtime game</option>
                </select>
                <div><input type="text" placeholder="Username" name = "username" required></input></div>
                <div><input type ="password" placeholder="Password" name = "password" required></input></div>
                <div><input type="number" placeholder="maxPlayers" name = "maxPlayers" required></input></div>
                <div><input type="number" placeholder="startingTroops" name = "startingTroops" required></input></div>
                <div><input type="number" placeholder="startingCountries" name = "startingCountries" required></input></div>
                <input type="submit" name="submit" value="create"></input>
            </form>
          </div>
        </div>
      )
    }
  }            

  ReactDOM.render(<App />, document.getElementById('app'));