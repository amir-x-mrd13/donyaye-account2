(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const KEYS = {name:'atomicStudentName', lessons:'atomicLessons', tasks:'atomicTasks', submissions:'atomicSubmissions'};
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(16).slice(2));
  const notice = msg => { const el=$('#notice'); if(!el)return; el.textContent=msg; el.hidden=false; setTimeout(()=>el.hidden=true,3200); };
  const seededLessons = () => {
    const lessons=read(KEYS.lessons);
    if(!lessons.length) write(KEYS.lessons,[
      {id:'seed-weather',title:'برنامه آب‌وهوا',description:'نمونه آموزش پایتون؛ کد را دریافت و بررسی کن.',filename:'weather.py',code:'import requests\\n\\ncity = input(\"نام شهر را وارد کنید: \")\\nurl = f\"https://wttr.in/{city}?format=3\"\\nresponse = requests.get(url, timeout=10)\\nprint(response.text)',image:''},
      {id:'seed-ai',title:'برنامه چت‌بات',description:'نمونه آموزش ساخت چت‌بات با پایتون.',filename:'AI.py',code:'# نمونه کد چت‌بات\\nprint(\"سلام! به چت‌بات خوش آمدی.\")',image:''}
    ]);
  };
  if(page==='student'){
    seededLessons();
    const gate=$('#nameGate'), area=$('#studentArea'), form=$('#nameForm'), nameInput=$('#studentName');
    const showStudent = () => { const name=localStorage.getItem(KEYS.name); gate.hidden=!!name; area.hidden=!name; if(name){$('#helloName').textContent=name;renderLessons();renderTasks();} };
    form.addEventListener('submit',e=>{e.preventDefault();const name=nameInput.value.trim();if(!name)return;localStorage.setItem(KEYS.name,name);showStudent();});
    $('#changeName').addEventListener('click',()=>{localStorage.removeItem(KEYS.name);nameInput.value='';showStudent();gate.scrollIntoView({behavior:'smooth'});});
    function renderLessons(){const lessons=read(KEYS.lessons);$('#lessons').innerHTML=lessons.length?lessons.map(l=>`<article class="lesson-card">${l.image?`<img src="${l.image}" alt="" style="width:100%;max-height:150px;object-fit:cover;border-radius:10px">`:''}<span class="chip">Python</span><h3>${esc(l.title)}</h3><p class="muted">${esc(l.description||'')}</p><div class="card-actions"><button class="btn primary" data-download="${esc(l.id)}">دانلود کد TXT</button><button class="btn light" data-show="${esc(l.id)}">مشاهده کد</button></div><pre class="code-preview" data-code="${esc(l.id)}" hidden>${esc(l.code)}</pre></article>`).join(''):'<p class="muted">هنوز آموزشی اضافه نشده است.</p>';
      $$('[data-download]').forEach(b=>b.onclick=()=>{const l=read(KEYS.lessons).find(x=>x.id===b.dataset.download);if(l)downloadText(l.filename||'lesson.txt',l.code);});
      $$('[data-show]').forEach(b=>b.onclick=()=>{const pre=$(`[data-code="${CSS.escape(b.dataset.show)}"]`);pre.hidden=!pre.hidden;b.textContent=pre.hidden?'مشاهده کد':'بستن کد';});
    }
    function renderTasks(){const tasks=read(KEYS.tasks), subs=read(KEYS.submissions), name=localStorage.getItem(KEYS.name);$('#tasks').innerHTML=tasks.length?tasks.map(t=>{const mine=subs.filter(s=>s.taskId===t.id&&s.student===name).length;return `<article class="task-card"><span class="chip">${mine?'ارسال شده':'تکلیف فعال'}</span><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p><button class="btn primary" data-task="${esc(t.id)}">${mine?'ارسال دوباره':'ارسال تکلیف'}</button></article>`}).join(''):'<div class="panel"><p class="muted">فعلاً تکلیفی منتشر نشده است.</p></div>';
      $$('[data-task]').forEach(b=>b.onclick=()=>openTask(b.dataset.task));
    }
    function openTask(taskId){const t=read(KEYS.tasks).find(x=>x.id===taskId);if(!t)return;$('#dialogTitle').textContent=t.title;$('#dialogDescription').textContent=t.description;$('#studentCode').value='';$('#submitDialog').dataset.taskId=taskId;$('#submitDialog').showModal();}
    $('#closeDialog').onclick=()=>$('#submitDialog').close();
    $('#submitForm').addEventListener('submit',e=>{e.preventDefault();const code=$('#studentCode').value.trim();if(!code)return;const submissions=read(KEYS.submissions);submissions.push({id:id(),taskId:$('#submitDialog').dataset.taskId,taskTitle:$('#dialogTitle').textContent,student:localStorage.getItem(KEYS.name),code,submittedAt:new Date().toISOString(),status:'pending',note:''});write(KEYS.submissions,submissions);$('#submitDialog').close();renderTasks();notice('تکلیف با موفقیت در همین مرورگر ثبت شد.');});
    function downloadText(filename,text){const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename.replace(/[^\w.\-\u0600-\u06FF]/g,'_');a.click();URL.revokeObjectURL(url);}
    showStudent();
  }
  if(page==='teacher'){
    const gate=$('#teacherGate'), area=$('#teacherArea');
    $('#teacherLogin').addEventListener('submit',e=>{e.preventDefault();if($('#teacherCode').value==='62458'){sessionStorage.setItem('atomicTeacherDemo','yes');gate.hidden=true;area.hidden=false;renderAll();}else $('#loginError').hidden=false;});
    $('#teacherLogout').onclick=()=>{sessionStorage.removeItem('atomicTeacherDemo');gate.hidden=false;area.hidden=true;$('#teacherCode').value='';};
    if(sessionStorage.getItem('atomicTeacherDemo')==='yes'){gate.hidden=true;area.hidden=false;}
    $$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.tab-panel').forEach(p=>p.hidden=p.id!==b.dataset.tab);if(b.dataset.tab==='submissionsTab')renderSubmissions();});
    $('#lessonForm').addEventListener('submit',async e=>{e.preventDefault();const file=$('#lessonFile').files[0];if(!file)return;const code=await file.text();let image='';const img=$('#lessonImage').files[0];if(img){if(img.size>900000){notice('تصویر باید کمتر از 900 کیلوبایت باشد.');return;}image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(img);});}const lessons=read(KEYS.lessons);lessons.unshift({id:id(),title:$('#lessonTitle').value.trim(),description:$('#lessonDescription').value.trim(),filename:file.name,code,image});write(KEYS.lessons,lessons);e.target.reset();renderLessonsAdmin();notice('آموزش اضافه شد.');});
    $('#taskForm').addEventListener('submit',e=>{e.preventDefault();const tasks=read(KEYS.tasks);tasks.unshift({id:id(),title:$('#taskTitle').value.trim(),description:$('#taskDescription').value.trim(),createdAt:new Date().toISOString()});write(KEYS.tasks,tasks);e.target.reset();renderTasksAdmin();notice('تکلیف منتشر شد.');});
    function renderLessonsAdmin(){const lessons=read(KEYS.lessons);$('#lessonAdminList').innerHTML='<h3>آموزش‌های ثبت‌شده</h3>'+ (lessons.length?lessons.map(l=>`<div class="admin-row"><div><strong>${esc(l.title)}</strong><p>${esc(l.filename||'فایل متنی')}</p></div><button class="btn light" data-delete-lesson="${esc(l.id)}">حذف</button></div>`).join(''):'<p class="muted">آموزشی ثبت نشده.</p>');$$('[data-delete-lesson]').forEach(b=>b.onclick=()=>{write(KEYS.lessons,read(KEYS.lessons).filter(l=>l.id!==b.dataset.deleteLesson));renderLessonsAdmin();});}
    function renderTasksAdmin(){const tasks=read(KEYS.tasks);$('#taskAdminList').innerHTML='<h3>تکالیف ثبت‌شده</h3>'+ (tasks.length?tasks.map(t=>`<div class="admin-row"><div><strong>${esc(t.title)}</strong><p>${esc(t.description)}</p></div><button class="btn light" data-delete-task="${esc(t.id)}">حذف</button></div>`).join(''):'<p class="muted">تکلیفی ثبت نشده.</p>');$$('[data-delete-task]').forEach(b=>b.onclick=()=>{write(KEYS.tasks,read(KEYS.tasks).filter(t=>t.id!==b.dataset.deleteTask));renderTasksAdmin();renderSubmissions();});}
    function renderSubmissions(){const tasks=read(KEYS.tasks),subs=read(KEYS.submissions).sort((a,b)=>new Date(a.submittedAt)-new Date(b.submittedAt));$('#submissionList').innerHTML=subs.length?subs.map((s,i)=>`<div class="submission-row"><div><span class="chip">ارسال ${i+1}</span><strong>${esc(s.student)}</strong><p>${esc(tasks.find(t=>t.id===s.taskId)?.title||s.taskTitle||'تکلیف حذف‌شده')} · ${new Date(s.submittedAt).toLocaleString('fa-IR')}</p><span class="status ${esc(s.status)}">${s.status==='approved'?'تأیید شده':s.status==='revision'?'نیاز به اصلاح':'در انتظار بررسی'}</span></div><button class="btn primary" data-review="${esc(s.id)}">مشاهده کد</button></div>`).join(''):'<p class="muted">هنوز دانش‌آموزی تکلیفی ارسال نکرده است. ارسال‌های این نسخه فقط در همین مرورگر مشترک هستند.</p>';$$('[data-review]').forEach(b=>b.onclick=()=>openReview(b.dataset.review));}
    function openReview(subId){const s=read(KEYS.submissions).find(x=>x.id===subId);if(!s)return;$('#reviewDialog').dataset.submissionId=subId;$('#reviewHeading').textContent=s.student+' — '+s.taskTitle;$('#reviewCode').textContent=s.code;$('#reviewStatus').value=s.status||'pending';$('#reviewNote').value=s.note||'';$('#reviewDialog').showModal();}
    $('#closeReview').onclick=()=>$('#reviewDialog').close();
    $('#reviewForm').addEventListener('submit',e=>{e.preventDefault();const subs=read(KEYS.submissions),s=subs.find(x=>x.id===$('#reviewDialog').dataset.submissionId);if(s){s.status=$('#reviewStatus').value;s.note=$('#reviewNote').value.trim();write(KEYS.submissions,subs);}$('#reviewDialog').close();renderSubmissions();notice('نتیجه بررسی در همین مرورگر ذخیره شد.');});
    function renderAll(){renderLessonsAdmin();renderTasksAdmin();renderSubmissions();}
    if(!area.hidden)renderAll();
  }
})();