if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/script/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

$(document).keypress(function(e) {
  if(e.which == 13) {
    $("#addModalBox").modal();
  }
});

const tFinal = 'kunjTodoTodos';
const pFinal = 'kunjTodoPrioBool';
const taskStatusOngoingFinal = 'ongoing';
const taskStatusToDoFinal = 'todo';
const taskStatusDoneFinal = 'done';
const taskStatusRemoveFinal = 'remove';
function getPriorityStatusFromDatabase() {
	var priorityBool = new Array;
	var priorityBoolStr = localStorage.getItem(pFinal); //true means priority set
	if (priorityBoolStr!=null) {
		priorityBool = JSON.parse(priorityBoolStr);
	}
	else {
		priorityBool = JSON.parse("[1,2,3,4,5,6,7,8,9,10]");
	}
	return priorityBool;
}
function setPriorityStatus() {
	if(document.getElementById('taskPriorityButton').innerHTML="Add Priority") {
		var priorityBool = getPriorityStatusFromDatabase();
		var ul = document.getElementById('priorityAvailable');
		var li = ul.getElementsByTagName('li');
		
		for(var i=0;i<li.length;i++) {
			li[i].className="hidden";
		}
		
		for(var i=0;i<priorityBool.length;i++) {
			li[priorityBool[i]-1].className="";
		}

		prioriySettler();
	}
}
function prioriySettler() {
	var ul = document.getElementById('priorityAvailable');
	var li = ul.getElementsByTagName('li');
	var active = document.getElementById('taskPriority').innerHTML;
	if(active!=0) {
		li[active-1].className="active";
		setPriority(active);
	}
	else
		document.getElementById('taskPriorityButton').innerHTML="Add Priority";
}	
function setPriority(i) {
		document.getElementById('taskPriority').innerHTML = i;
		//change button text and add badge to it...
		document.getElementById('taskPriorityButton').innerHTML
		="Priority <span class='badge'>"+i+"</span>";

}
function updatePriorityToDatabase(i) {
	if(i!=0) {
		var priorityBool = getPriorityStatusFromDatabase();
		for(var j=0;j<priorityBool.length;j++) {
			if(priorityBool[j]==i) {
				priorityBool.splice(j,1);
			}	
		}
		localStorage.setItem(pFinal,JSON.stringify(priorityBool));
	}
}
function addPriorityToDatabase(i) {
	var priorityBool = getPriorityStatusFromDatabase();
	var j=0;
	while(priorityBool[j]<=i) j++;
	priorityBool.splice(j,0,parseInt(i));
	localStorage.setItem(pFinal,JSON.stringify(priorityBool));
}
function addBoxInitializer() {
	//remove next line if want to store last set priority
	document.getElementById('taskPriority').innerHTML=0; 

	prioriySettler();
	var priorityBool = getPriorityStatusFromDatabase();
	if(priorityBool.length==0) {
		var s = document.getElementById('taskPriorityButton').className;
		document.getElementById('taskPriorityButton').className=s+" disabled";
	}
	//Add description box hidder
}

function getTodos() {
	var todos = new Array;
	var todos_str = localStorage.getItem(tFinal);
	if(todos_str != null) {
		todos = JSON.parse(todos_str);
	}
	return todos;
}
function addTask () {
	//taskText
	//taskDescription
	//taskPriority

	var taskText = document.getElementById('taskText').value;
	var taskDescription = document.getElementById('taskDescription').value;
	var taskPriority = document.getElementById('taskPriority').innerHTML;

	var task = new Object;
	task.text = taskText;
	task.description = taskDescription;
	task.status = taskStatusToDoFinal; 
	task.priority = taskPriority;

	var todos = getTodos();
	var tempTask;
	var tempArray = new Array;
	while (true) {
		tempTask=todos.shift();
		//console.log(tempTask);
		if(tempTask==null) {
			todos.unshift(task);
			break;
		}
		else if(tempTask.priority==0 || (taskPriority!=0&&task.priority<tempTask.priority)) {
			todos.unshift(tempTask);
			todos.unshift(task);
			break;
		}
		else if (task.priority>tempTask.priority||task.priority==0) {
			tempArray.push(tempTask);
		}

	}
	while(tempArray.length!=0) {
		todos.unshift(tempArray.pop());
	}
	
	updatePriorityToDatabase(taskPriority);
	document.getElementById('taskPriority').innerHTML=0;

	localStorage.setItem(tFinal,JSON.stringify(todos));

	document.forms['taskForm'].reset();	
	show();
}

function show() {
	var todos = getTodos();
	
	var html="";
	var htmlToDo = document.getElementById('todoList');
	var htmlOngoing = document.getElementById('ongoingList');
	var htmlDone = document.getElementById('doneList');
	htmlToDo.innerHTML="";
	htmlOngoing.innerHTML="";
	htmlDone.innerHTML="";
	for(var i=0; i<todos.length;i++) {
		html="";
		html+="<li class='list-group-item' id='"+i+"' onclick='additionalDetails("+i+")'>" + todos[i].text;
		if(todos[i].priority!=0) {
			html+="<span class='badge'>"+todos[i].priority+"</span>";
		}
		html+="</li>";
		switch(todos[i].status) {
			case taskStatusToDoFinal:htmlToDo.innerHTML+=html;break;
			case taskStatusOngoingFinal:htmlOngoing.innerHTML+=html;break;
			case taskStatusDoneFinal:htmlDone.innerHTML+=html;break;
		}
	}
}

function additionalDetails(i) {
	var id=i;
	var todos = getTodos();

	document.getElementById('taskDetailsModalTitle').innerHTML=todos[i].text;
	if(todos[i].description!="")
		document.getElementById('taskDetailsModalDescription').innerHTML=todos[i].description;
	else
		document.getElementById('taskDetailsModalDescription').innerHTML="No Description Found";
	var strP,strN;
	switch(todos[i].status) {
		case taskStatusToDoFinal: strP="Remove"; strN = "Ongoing";break;
		case taskStatusOngoingFinal:strP="To-Do"; strN = "Done";break;
		case taskStatusDoneFinal: strP="Ongoing"; strN = "Remove";break;
	}
	document.getElementById('taskDetailsModalButtonP').innerHTML=strP;
	document.getElementById('taskDetailsModalButtonN').innerHTML=strN;
	document.getElementById('taskDetailsModalButtonP').onclick=function(){buttonP(i)};
	document.getElementById('taskDetailsModalButtonN').onclick=function(){buttonN(i)};
	$("#taskDetailsModal").modal();
	/*switch(todos[i].status) {
		case taskStatusToDoFinal:todos[i].status=taskStatusOngoingFinal; console.log(todos[i]);break;
		case taskStatusOngoingFinal:todos[i].status=taskStatusDoneFinal;break;
		case taskStatusDoneFinal:break;//todos[i].status
	}
	localStorage.setItem(tFinal,JSON.stringify(todos));
	show();*/
}

function buttonP(i) {
	var todos=getTodos();
	switch(todos[i].status) {
		case taskStatusToDoFinal:todos[i].status=taskStatusRemoveFinal;break;
		case taskStatusOngoingFinal:todos[i].status=taskStatusToDoFinal;break;
		case taskStatusDoneFinal:todos[i].status=taskStatusOngoingFinal;break;
	}
	if(todos[i].status==taskStatusRemoveFinal&&todos[i].priority>0) {
		addPriorityToDatabase(todos[i].priority);
	}

	localStorage.setItem(tFinal,JSON.stringify(todos));
	show();	
}

function buttonN(i) {
	var todos=getTodos();
	switch(todos[i].status) {
		case taskStatusToDoFinal:todos[i].status=taskStatusOngoingFinal;break;
		case taskStatusOngoingFinal:todos[i].status=taskStatusDoneFinal;break;
		case taskStatusDoneFinal:todos[i].status=taskStatusRemoveFinal;break;
	}
	
	if(todos[i].status==taskStatusRemoveFinal&&todos[i].priority>0) {
		addPriorityToDatabase(todos[i].priority);
	}
	localStorage.setItem(tFinal,JSON.stringify(todos));
	show();
}



document.getElementById('taskPriorityButton').addEventListener('click',setPriorityStatus);
show();