import React, {useEffect, memo} from "react";
import TaskItem from "./TaskItem";
import './TaskList.sass'
import {useDispatch, useSelector} from "react-redux";
import {fetchTasks} from "../../actions/taskActions";


const TaskList = (props) => {



    const elements = props.tasks.map((task) => {
        return <TaskItem key={task._id} id={task._id} taskText={task.name} isChecked={task.checked}/>
    });

    return (
        <div className='task-list'>
            {elements}
        </div>
    );
};

export default memo(TaskList);
