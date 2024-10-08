let globalSettings;
let stopped=false;

let inprogress_icon=`
  <div style="display: inline-block; vertical-align: sub; height:16px; width:16px; margin-top: 2px">
    <svg width="100%" height="100%" fill="none" viewBox="0 0 16 16" class="anim-rotate" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" stroke="#DBAB0A" stroke-width="2" d="M3.05 3.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9Z" opacity=".5"></path>
      <path fill="#DBAB0A" fill-rule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clip-rule="evenodd"></path>
      <path fill="#DBAB0A" d="M14 8a6 6 0 0 0-6-6V0a8 8 0 0 1 8 8h-2Z"></path>
    </svg>
  </div>
`;
let queued_icon=`
  <div style="display: inline-block; vertical-align: sub;">
    <svg width="16" height="16" style="margin-top: 2px;vertical-align: top; color: #c69026 !important;fill: currentColor;" viewBox="0 0 16 16" version="1.1"><path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"></path></svg>
  </div>
`;
let success_icon=`
  <div style="display: inline-block; vertical-align: sub;">
    <svg width="16" height="16" style="margin-top: 2px;vertical-align: top;color: #57AB5A !important;fill: currentColor;" viewBox="0 0 16 16" version="1.1" ><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"></path></svg>
  </div>
`;
let error_icon=`
<div style="display: inline-block; vertical-align: sub;">
    <svg width="16" height="16" style="margin-top: 2px; color:rgb(229, 83, 75);fill:currentColor" viewBox="0 0 16 16" version="1.1"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>
</div>
`;


    function SaveConfig() {
        globalSettings.name=document.getElementById("name").value;
        globalSettings.token=document.getElementById("token").value;
	if (document.getElementById("orgs").checked) {
          globalSettings.area = "orgs";
	} else {
          globalSettings.area = "users";
        }
        localStorage.setItem("Settings", JSON.stringify(globalSettings));
	let stopped=false; //we changed settings, so it may actually work.
        if (globalSettings.token === "") {
          clearInterval(triggerTimer)
          triggerTimer = setInterval(UpdateWorkflows,360000);
        } else {
          clearInterval(triggerTimer)
          triggerTimer = setInterval(UpdateWorkflows,60000);
        }
    }

    function LoadConfig() {
        globalSettings = JSON.parse(localStorage.getItem("Settings"));
        if (globalSettings === null) {
            globalSettings = {token:"",area:"orgs",name:"CatPoweredPlugins"};
        }
        document.getElementById("name").value=globalSettings.name;
        document.getElementById("token").value=globalSettings.token;
	document.getElementById(globalSettings.area).checked=true;
    }

    function CreateElement(run) {
        let rowTemplate = `
          <div class="table-row" >
            <div style="padding: 5px;">
              <div style="max-width: 300px;display: inline-block;vertical-align: top;">
                <a href="${run.html_url}">
                  ${run.status==="queued"?queued_icon:inprogress_icon}
                  <span style="min-width: 95%">${run.display_title}</span>
                </a>
                <br />
                <span class="text-small"><span class="text-bold">${run.name}</span>#${run.run_number}<span> by <a href="${run.actor.html_url}">${run.actor.login}</a></span></span>  
              </div>
              <div style="display: inline;vertical-align: middle; margin-left: 4%;padding-top: 20px;">
                <a class="branch-name" target="_parent" style="max-width: 200px;" title="${run.repository.name+"/"+run.head_branch}" href="${run.repository.html_url+"/tree/refs/heads/"+run.head_branch}">${run.repository.name+"/"+run.head_branch}</a>
              </div>
              <div style="float: right;">
                 <div class="text-small" style="display: inline-block;">
                   <div>
                     <div>
                       <span>
                         <!-- calendar icon -->
                         <div style="display: inline-block; vertical-align: sub;">
                           <svg height="16" viewBox="0 0 16 16" version="1.1" width="16">
                             <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z"></path>
                           </svg>
                         </div>
                         <!-- /icon -->
                         <relative-time tense="past" datetime="${run.created_at}" data-view-component="true" title="${run.created_at}">${run.created_at}</relative-time>
                       </span>
                     </div>        
                   </div>
                 </div>
                 <div class="text-small" style="display: block;">
                   <span>
                     <!-- clock icon -->
                     <svg height="16" viewBox="0 0 16 16" version="1.1" width="16">
                       <path d="M5.75.75A.75.75 0 0 1 6.5 0h3a.75.75 0 0 1 0 1.5h-.75v1l-.001.041a6.724 6.724 0 0 1 3.464 1.435l.007-.006.75-.75a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734l-.75.75-.006.007a6.75 6.75 0 1 1-10.548 0L2.72 5.03l-.75-.75a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l.75.75.007.006A6.72 6.72 0 0 1 7.25 2.541V1.5H6.5a.75.75 0 0 1-.75-.75ZM8 14.5a5.25 5.25 0 1 0-.001-10.501A5.25 5.25 0 0 0 8 14.5Zm.389-6.7 1.33-1.33a.75.75 0 1 1 1.061 1.06L9.45 8.861A1.503 1.503 0 0 1 8 10.75a1.499 1.499 0 1 1 .389-2.95Z"></path>
                     </svg>
                     <!-- /icon -->
                     <span>${run.status==="queued"?"Queued":"In Progress"}</span>
                   </span>
                 </div>
              </div>
            </div>
          </div>
        `;
        return rowTemplate;
    }
    
    async function UpdateWorkflows() {
      if (stopped) {
        return;
      }
      let statusElement=document.getElementById("status");
      statusElement.title="Updating...";
      statusElement.innerHTML=inprogress_icon;

      let request_repos = new Request(`https://api.github.com/${globalSettings.area}/${globalSettings.name}/repos`, { method: "GET" });
      if (globalSettings.token !== "") {
	request_repos.headers.append("Authorization", `Bearer ${globalSettings.token}`);
      }
      let response_repos = await fetch(request_repos).then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      }).then(json => {
	this.repos = json;
      }).catch((err) => this.err = err);

      if (typeof err != 'undefined') {
	stopped = true;
        statusElement.title=err.message;
        statusElement.innerHTML=error_icon;
        return;
      }
      
      let runs=[];
      for (let repo of repos) {
        let request_workflows = new Request(`https://api.github.com/repos/${globalSettings.name}/${repo.name}/actions/runs`, { method: "GET" });
        if (globalSettings.token !== "") {
          request_workflows.headers.append("Authorization", `Bearer ${globalSettings.token}`);
        }
        let response_workflows = await fetch(request_workflows).then(response => {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        }).then(json => {
          this.workflows = json;
        }).catch((err) => this.err2 = err);

      if (typeof err2 != 'undefined') {
	stopped = true;
        statusElement.title=err2.message;
        statusElement.innerHTML=error_icon;
        return;
      }
;
        runs = runs.concat(workflows.workflow_runs);
      }
      let template=`
        <div class="vis-only-no-siblings table-row">
	  <center><p><h3>No pending/running jobs found</h3></p></center>
        </div>
      `;
      for (let run of runs) {
        console.log(run.repository.name+" : "+run.name+" : "+run.status);
	if (run.status === "in_progress") {
	  template = CreateElement(run) + template;  
	}
	if (run.status === "queued") {
	  template = template + CreateElement(run);
	}
      }
      document.getElementById("workarea").innerHTML=template;
      statusElement.title="Updated successfuly";
      statusElement.innerHTML=success_icon;
    }


LoadConfig();
UpdateWorkflows();
let triggerTimer;
if (globalSettings.token === "") {
  triggerTimer = setInterval(UpdateWorkflows,360000);
} else {
  triggerTimer = setInterval(UpdateWorkflows,60000);
}
