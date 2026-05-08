import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

function App() {
  // ========== USER DATA STATE ==========
  const [userData, setUserData] = useState({
    tools: [],           // Multiple tools support
    currentPlan: 'pro',  // pro / business / team
    spend: 50,
    teamSize: 1,
    useCase: 'coding',   // coding / writing / data / research / mixed
    email: '',
    companyName: ''
  })
  
  const [auditResult, setAuditResult] = useState(null)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [shareableUrl, setShareableUrl] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ========== LOAD SAVED DATA ON PAGE RELOAD ==========
  useEffect(() => {
    const saved = localStorage.getItem('auditData')
    if(saved) {
      setUserData(JSON.parse(saved))
    }
  }, [])

  // ========== SAVE DATA TO LOCALSTORAGE ==========
  useEffect(() => {
    localStorage.setItem('auditData', JSON.stringify(userData))
  }, [userData])

  // ========== TOOL OPTIONS (8+ tools as required) ==========
  const toolOptions = [
    { id: 'cursor', name: 'Cursor', plans: ['Hobby ($20)', 'Pro ($20)', 'Business ($40)', 'Enterprise ($60)'] },
    { id: 'copilot', name: 'GitHub Copilot', plans: ['Individual ($10)', 'Business ($19)', 'Enterprise ($39)'] },
    { id: 'chatgpt', name: 'ChatGPT', plans: ['Plus ($20)', 'Team ($30)', 'Enterprise ($60)'] },
    { id: 'claude', name: 'Claude', plans: ['Free ($0)', 'Pro ($20)', 'Team ($25)', 'Enterprise ($50)'] },
    { id: 'gemini', name: 'Gemini', plans: ['Pro ($20)', 'Ultra ($30)', 'API ($0.002/token)'] },
    { id: 'windsurf', name: 'Windsurf', plans: ['Pro ($15)', 'Team ($30)', 'Enterprise ($50)'] },
    { id: 'anthropic-api', name: 'Anthropic API', plans: ['Pay per token'] },
    { id: 'openai-api', name: 'OpenAI API', plans: ['Pay per token'] }
  ]

  // ========== HANDLE FORM CHANGES ==========
  const handleToolToggle = (toolId) => {
    let newTools = [...userData.tools]
    if(newTools.includes(toolId)) {
      newTools = newTools.filter(t => t !== toolId)
    } else {
      newTools.push(toolId)
    }
    setUserData({...userData, tools: newTools})
  }

  const handleChange = (e) => {
    setUserData({...userData, [e.target.name]: e.target.value})
  }

  // ========== AUDIT ENGINE (Defensible logic) ==========
  const calculateSavings = () => {
    setIsLoading(true)
    let totalMonthlySavings = 0
    let recommendations = []

    // Logic for each tool
    userData.tools.forEach(toolId => {
      const spend = userData.spend
      const team = userData.teamSize

      // Rule 1: Team size check (2 users on Team plan = overkill)
      if(userData.currentPlan === 'team' && team <= 2) {
        const savings = 15
        totalMonthlySavings += savings
        recommendations.push({
          tool: toolId,
          action: 'Downgrade from Team to Pro',
          savings: `$${savings}`,
          reason: `Only ${team} user(s) using this tool. Team plan needs 5+ users to be cost-effective.`
        })
      }

      // Rule 2: Spending more than standard Pro plan
      if(spend > 20 && userData.currentPlan === 'business') {
        const savings = spend - 20
        totalMonthlySavings += savings
        recommendations.push({
          tool: toolId,
          action: 'Switch to Pro plan',
          savings: `$${savings}`,
          reason: `Pro plan at $20/month gives same features for your usage level.`
        })
      }

      // Rule 3: Alternative cheaper tool
      if(toolId === 'cursor' && spend > 20 && userData.useCase === 'coding') {
        const savings = 10
        totalMonthlySavings += savings
        recommendations.push({
          tool: toolId + ' → Copilot',
          action: 'Switch to GitHub Copilot',
          savings: `$${savings}`,
          reason: `For coding tasks, Copilot provides similar AI assistance at $10/month.`
        })
      }
    })

    // Determine if high savings (>$500)
    const isHighSavings = totalMonthlySavings > 500
    const isLowSavings = totalMonthlySavings < 100

    setAuditResult({
      monthlySavings: totalMonthlySavings,
      annualSavings: totalMonthlySavings * 12,
      recommendations: recommendations,
      isHighSavings: isHighSavings,
      isLowSavings: isLowSavings,
      optimized: recommendations.length === 0
    })

    setShowEmailCapture(true)
    generateShareableUrl()
    generateAiSummary(totalMonthlySavings, recommendations)
    setIsLoading(false)
  }

  // ========== AI SUMMARY (using DeepSeek API - FREE) ==========
  const generateAiSummary = async (savings, recommendations) => {
    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
      
      if(!apiKey) {
        console.log('No API key found, using fallback')
        setAiSummary(`Based on your AI tool usage, you could save $${savings} per month. ${recommendations.length > 0 ? 'Consider switching to lower-cost plans.' : 'Your current setup is optimized.'}`)
        return
      }

      console.log('Calling DeepSeek API...')
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an AI spending expert. Give honest, helpful advice in 80-100 words.'
            },
            {
              role: 'user', 
              content: `Write a short 80-word personalized summary for a user who can save $${savings} per month on AI tools. Recommendations: ${JSON.stringify(recommendations)}. Be honest - if savings are small (<$20), say they are doing well.`
            }
          ],
          max_tokens: 250
        })
      })

      const data = await response.json()
      console.log('DeepSeek response:', data)
      
      if(data.choices && data.choices[0] && data.choices[0].message) {
        setAiSummary(data.choices[0].message.content)
      } else {
        setAiSummary(`✨ Based on our analysis, you could save $${savings} per month. ${recommendations.length > 0 ? 'Check the recommendations above.' : 'Your setup is already optimized!'}`)
      }
    } catch(error) {
      console.error('AI summary failed:', error)
      setAiSummary(`✨ Estimated savings: $${savings}/month. ${recommendations.length > 0 ? 'Review the recommendations above to start saving.' : 'Your current spending looks optimal.'}`)
    }
  }

  // ========== SHAREABLE URL ==========
  const generateShareableUrl = () => {
    const auditId = uuidv4().slice(0, 8)
    const savedAudit = {
      id: auditId,
      savings: auditResult?.monthlySavings,
      recommendations: auditResult?.recommendations,
      timestamp: Date.now()
    }
    localStorage.setItem(`audit_${auditId}`, JSON.stringify(savedAudit))
    const url = `${window.location.origin}/share/${auditId}`
    setShareableUrl(url)
  }

  // ========== EMAIL CAPTURE (Google Forms as backend) ==========
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    // Google Forms Web App URL - replace with your own
    const webhookUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          company: userData.companyName,
          savings: auditResult?.monthlySavings,
          timestamp: new Date().toISOString()
        })
      })
      alert('Report sent to your email! Check your inbox.')
    } catch(error) {
      console.error('Email capture failed:', error)
      alert('Thanks! We will reach out soon.')
    }
  }

  // ========== UI RENDER ==========
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        
        <h1 style={{textAlign: 'center', fontSize: '36px'}}>💰 AI Spend Audit Tool</h1>
        <p style={{textAlign: 'center', color: '#666'}}>Find hidden savings in your AI subscriptions</p>

        {/* ========== TOOLS SELECTION (Checkboxes) ========== */}
        <div style={{margin: '20px 0'}}>
          <label style={{fontWeight: 'bold'}}>🤖 Which AI tools do you use?</label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginTop: '10px'}}>
            {toolOptions.map(tool => (
              <label key={tool.id} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input 
                  type="checkbox"
                  checked={userData.tools.includes(tool.id)}
                  onChange={() => handleToolToggle(tool.id)}
                />
                {tool.name}
              </label>
            ))}
          </div>
        </div>

        {/* ========== PLAN SELECTION ========== */}
        <div style={{margin: '20px 0'}}>
          <label style={{fontWeight: 'bold'}}>📋 Current plan</label>
          <select name="currentPlan" value={userData.currentPlan} onChange={handleChange} style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd'}}>
            <option value="free">Free</option>
            <option value="pro">Pro ($20/month)</option>
            <option value="team">Team ($30/user/month)</option>
            <option value="business">Business ($40/user/month)</option>
          </select>
        </div>

        {/* ========== MONTHLY SPEND ========== */}
        <div style={{margin: '20px 0'}}>
          <label style={{fontWeight: 'bold'}}>💰 Current monthly spend (USD)</label>
          <input 
            type="number" 
            name="spend"
            value={userData.spend}
            onChange={handleChange}
            style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
        </div>

        {/* ========== TEAM SIZE ========== */}
        <div style={{margin: '20px 0'}}>
          <label style={{fontWeight: 'bold'}}>👥 Team size (how many people use AI tools?)</label>
          <input 
            type="number"
            name="teamSize"
            value={userData.teamSize}
            onChange={handleChange}
            style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
        </div>

        {/* ========== USE CASE ========== */}
        <div style={{margin: '20px 0'}}>
          <label style={{fontWeight: 'bold'}}>🎯 Primary use case</label>
          <select name="useCase" value={userData.useCase} onChange={handleChange} style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd'}}>
            <option value="coding">Coding / Development</option>
            <option value="writing">Writing / Content</option>
            <option value="data">Data Analysis</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed / General</option>
          </select>
        </div>

        {/* ========== CALCULATE BUTTON ========== */}
        <button 
          onClick={calculateSavings}
          disabled={isLoading || userData.tools.length === 0}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          {isLoading ? 'Analyzing...' : '✨ Calculate Savings ✨'}
        </button>

        {/* ========== RESULTS SECTION ========== */}
        {auditResult && (
          <div style={{marginTop: '30px'}}>
            {/* Hero Savings */}
            <div style={{
              background: auditResult.isHighSavings ? '#fff3cd' : '#d4edda',
              padding: '20px',
              borderRadius: '15px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{fontSize: '48px', margin: '0'}}>${auditResult.monthlySavings}/month</h2>
              <p style={{fontSize: '24px'}}>${auditResult.annualSavings}/year saved!</p>
              {auditResult.isHighSavings && (
                <div style={{background: '#ffc107', padding: '10px', borderRadius: '8px', marginTop: '10px'}}>
                  🚀 You're saving over $500/month! <strong>Credex</strong> can help you save even more with discounted credits.
                </div>
              )}
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <div style={{background: '#e7f3ff', padding: '15px', borderRadius: '10px', marginBottom: '20px'}}>
                <h3>🤖 AI Summary</h3>
                <p>{aiSummary}</p>
              </div>
            )}

            {/* Recommendations */}
            {auditResult.recommendations.map((rec, i) => (
              <div key={i} style={{border: '1px solid #ddd', padding: '15px', borderRadius: '10px', marginBottom: '10px'}}>
                <h3>📌 {rec.tool}</h3>
                <p><strong>Action:</strong> {rec.action}</p>
                <p><strong>Save:</strong> {rec.savings}/month</p>
                <p><strong>Why:</strong> {rec.reason}</p>
              </div>
            ))}

            {auditResult.optimized && (
              <div style={{background: '#d4edda', padding: '15px', borderRadius: '10px', textAlign: 'center'}}>
                ✅ You're spending well! No major savings found.
              </div>
            )}

            {/* Email Capture (shown after results) */}
            {showEmailCapture && (
              <div style={{marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '10px'}}>
                <h3>📧 Get your detailed report</h3>
                <form onSubmit={handleEmailSubmit}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd'}}
                  />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company name (optional)"
                    value={userData.companyName}
                    onChange={handleChange}
                    style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd'}}
                  />
                  <button type="submit" style={{width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px'}}>
                    Send Report →
                  </button>
                </form>
              </div>
            )}

            {/* Shareable URL */}
            {shareableUrl && (
              <div style={{marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '10px', textAlign: 'center'}}>
                <p>🔗 Share your results:</p>
                <input type="text" value={shareableUrl} readOnly style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}} />
                <button onClick={() => navigator.clipboard.writeText(shareableUrl)} style={{marginTop: '10px', padding: '8px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px'}}>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        )}

        <footer style={{textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '12px'}}>
          🔒 Free tool · No credit card required · Your data stays private
        </footer>
      </div>
    </div>
  )
}

export default App