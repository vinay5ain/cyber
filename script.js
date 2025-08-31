(() => {
  // QUIZ DATA
  const QUIZ = [
    { id: 'q1', topic: 'Phishing', question: "You receive an email from 'support@paypaI.com'. What should you do?", choices: ['Click the link and reset immediately', 'Ignore it and report as phishing', 'Reply to ask if it is real'], answer: 1, explain: 'The domain has a typo. Report and access site manually.' },
    { id: 'q2', topic: 'Passwords', question: 'Which password is strongest?', choices: ['P@ssw0rd!', 'ilovefootball2025', 'mango-otter-violin-39'], answer: 2, explain: 'A long passphrase with multiple unrelated words is strong and memorable.' },
    { id: 'q3', topic: 'Malware', question: "A website offers a 'free cracked' version of a paid app. Safest action?", choices: ['Download and scan later', 'Avoid and use legitimate sources', 'Disable antivirus first'], answer: 1, explain: 'Cracked software often carries malware. Use official sources.' }
  ];

  const SCENARIOS = [
    { id: 's1', title: 'Suspicious Email', prompt: "Your 'bank' sends a link saying your account will close in 24 hours unless you verify. Link: bank-secure-login.co", options: [ {text:'Click link and login quickly', score:-2, feedback:'Likely phishing. Dangerous.'}, {text:'Hover/check domain & call bank directly', score:3, feedback:'Excellent choice! Verify through official contact.'}, {text:'Forward to friends to ask if real', score:0, feedback:'Spreads phishing risk.'} ] }
  ];

  const EMAIL_FLAGS = [
    {id:'urgent', label:'Urgency / threat of consequences'},
    {id:'typoDomain', label:'Suspicious or lookalike domain'},
    {id:'attachments', label:'Unexpected attachment or link'},
    {id:'requestInfo', label:'Asks for passwords or sensitive info'}
  ];
  const correctFlags = new Set(['urgent','typoDomain','attachments','requestInfo']);

  // STATE
  const state = { stage:'intro', score:0, quizIndex:0, scenarioIndex:0, answers:{}, completedStages:0 };
  const totalStages=4;

  const app=document.getElementById('app'), progressBar=document.getElementById('progressBar');
  const resetBtn=document.getElementById('resetBtn'), toggleTheme=document.getElementById('toggleTheme');

  function updateProgress(){progressBar.style.width=Math.round((state.completedStages/totalStages)*100)+'%';}
  function setStage(stage){state.stage=stage; render();}

  function render(){
    updateProgress();
    if(state.stage==='intro') renderIntro();
    else if(state.stage==='quiz') renderQuiz();
    else if(state.stage==='scenarios') renderScenario();
    else if(state.stage==='password') renderPassword();
    else if(state.stage==='phishing') renderPhishing();
    else if(state.stage==='summary') renderSummary();
  }

  function renderIntro(){
    app.innerHTML=`
      <div class="grid cols-2">
        <div>
          <h2>Welcome!</h2>
          <p class="muted">This interactive game simulates real-life cyber security situations.</p>
          <ul><li>Spot phishing & fake domains</li><li>Build strong passwords</li><li>Practice safe decisions</li></ul>
          <button id="startBtn">Start Game</button>
        </div>
      </div>`;
    document.getElementById('startBtn').onclick=()=>{state.completedStages=0;setStage('quiz');};
  }

  function renderQuiz(){
    const q=QUIZ[state.quizIndex];
    app.innerHTML=`
      <div>
        <div><strong>Quiz</strong> <span class="small">Q${state.quizIndex+1}/${QUIZ.length}</span></div>
        <h3>${q.topic}</h3><p>${q.question}</p>
        <div class="choices">${q.choices.map((c,i)=>`<button data-choice="${i}">${c}</button>`).join('')}</div>
        <div id="quizExplain"></div>
      </div>`;
    app.querySelectorAll('.choices button').forEach(b=>b.onclick=()=>onQuizChoice(b,q));
  }

  function onQuizChoice(btn,q){
    const choice=Number(btn.dataset.choice), correct=choice===q.answer;
    if(correct) state.score+=3;
    state.answers[q.id]={choice,correct};
    document.querySelectorAll('.choices button').forEach(b=>b.disabled=true);
    document.getElementById('quizExplain').innerHTML=`<div class="explain"><strong>${correct?'✅ Correct':'❌ Wrong'}</strong><div>${q.explain}</div><button id="nextQ">${state.quizIndex<QUIZ.length-1?'Next':'Continue'}</button></div>`;
    document.getElementById('nextQ').onclick=()=>{ if(state.quizIndex<QUIZ.length-1){state.quizIndex++;renderQuiz();} else {state.completedStages=1;setStage('scenarios');} };
  }

  function renderScenario(){
    const s=SCENARIOS[state.scenarioIndex];
    app.innerHTML=`
      <div><strong>${s.title}</strong><p>${s.prompt}</p>
        <div>${s.options.map((o,i)=>`<button data-opt="${i}">${o.text}</button>`).join('')}</div>
        <div id="scenarioFeedback"></div>
      </div>`;
    app.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>onScenarioChoice(b,s));
  }

  function onScenarioChoice(btn,s){
    const opt=s.options[Number(btn.dataset.opt)];
    state.score+=opt.score;
    document.querySelectorAll('[data-opt]').forEach(b=>b.disabled=true);
    document.getElementById('scenarioFeedback').innerHTML=`<div class="explain"><div>${opt.feedback}</div><button id="nextS">Continue</button></div>`;
    document.getElementById('nextS').onclick=()=>{state.completedStages=2;setStage('password');};
  }

  function renderPassword(){
    app.innerHTML=`
      <div><strong>Password Mini-game</strong>
        <p class="muted">Type a sample password (not your real one).</p>
        <input id="pwd" type="text" placeholder="mango-otter-violin-39"/>
        <button id="checkPwd">Check Strength</button>
        <div id="pwdResult"></div>
      </div>`;
    document.getElementById('checkPwd').onclick=()=>{
      const pwd=document.getElementById('pwd').value.trim();
      const strength=pwd.length>=16?'Excellent':pwd.length>=12?'Strong':'Weak';
      if(strength==='Strong'||strength==='Excellent') state.score+=3; else state.score+=1;
      document.getElementById('pwdResult').innerHTML=`<div class="explain">Strength: ${strength}<br><button id="contPwd">Continue</button></div>`;
      document.getElementById('contPwd').onclick=()=>{state.completedStages=3;setStage('phishing');};
    };
  }

  function renderPhishing(){
    app.innerHTML=`
      <div><strong>Phishing Spotter</strong>
        <p>Select all red flags:</p>
        ${EMAIL_FLAGS.map(f=>`<label><input type="checkbox" data-flag="${f.id}"/> ${f.label}</label><br>`).join('')}
        <button id="submitFlags">Submit</button>
      </div>`;
    document.getElementById('submitFlags').onclick=()=>{
      const picked=[...app.querySelectorAll('[data-flag]:checked')].map(i=>i.dataset.flag);
      let pts=0;picked.forEach(p=>{if(correctFlags.has(p)) pts++;});
      state.score+=pts; state.completedStages=4; setStage('summary');
    };
  }

  function renderSummary(){
    app.innerHTML=`
      <div><strong>Summary</strong>
        <p>Final Score: ${state.score}</p>
        <button id="playAgain">Play Again</button>
      </div>`;
    document.getElementById('playAgain').onclick=resetGame;
  }

  function resetGame(){state.score=0;state.quizIndex=0;state.scenarioIndex=0;state.answers={};state.completedStages=0;setStage('intro');}
  function toggleThemeMode(){document.documentElement.toggleAttribute('data-theme','dark');}

  resetBtn.onclick=resetGame; 
  toggleTheme.onclick=toggleThemeMode; 
  render();
})();
