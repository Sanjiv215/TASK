import Navbar from '../Components/Navbar/Navbar'
import TaskBoard from '../Components/TaskBoard/TaskBoard'

const Home = () => {
    return (
        <div className="app-shell">
            <Navbar />
            <TaskBoard />
        </div>
    )
}

export default Home
