import { useState, useEffect } from 'react'

function App() {
  const [userData, setUserData] = useState({
    tools: 'chatgpt',
    spend: 50,
    team: 1
  })
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const newData = {...userData, [e.target.name]: e.target.value}
    setUserData(newData)
    localStorage.setItem('savedData', JSON.stringify(newData))
  }

  useEffect(() => {
    const saved = localStorage.getItem('savedData')
    if(saved) setUserData(JSON.parse(saved))
  }, [])

  const calculateSavings = () => {
    let savings = 0
    let suggestion = ''
    let recommendation = ''

    if(userData.tools === 'cursor' && userData.spend > 20) {
      savings = userData.spend - 20
      suggestion = `$${savings}`
      recommendation = `Switch from Cursor Business to Cursor Pro. Save $${savings}/month!`
    }
    else if(userData.tools === 'chatgpt' && userData.spend > 20) {
      savings = userData.spend - 20
      suggestion = `$${savings}`
      recommendation = `Downgrade to ChatGPT Plus. Save $${savings}/month!`
    }
    else if(userData.tools === 'claude' && userData.spend > 20) {
      savings = userData.spend - 20
      suggestion = `$${savings}`
      recommendation = `Use Claude Pro. Save $${savings}/month!`
    }
    else {
      suggestion = '$0'
      recommendation = "You're already optimized! Great job 👏"
    }

    setResult({savings, suggestion, recommendation})
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <h1 style={{
            fontSize: '48px',
            margin: '0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💰 AI Savings Finder
          </h1>
          <p style={{color: '#666', marginTop: '10px'}}>
            Find where you're overspending on AI tools
          </p>
        </div>

        {/* Form */}
        <div style={{marginBottom: '30px'}}>
          {/* Tool Card */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333'
            }}>
              🤖 Which AI tool do you use?
            </label>
            <select 
              name="tools" 
              value={userData.tools} 
              onChange={handleChange} 
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="cursor">Cursor</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          {/* Spend Card */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333'
            }}>
              💵 Monthly spend (USD)
            </label>
            <input 
              type="number" 
              name="spend"
              value={userData.spend}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '16px'
              }}
              placeholder="e.g., 50"
            />
          </div>

          {/* Team Card */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333'
            }}>
              👥 Team size
            </label>
            <input 
              type="number"
              name="team"
              value={userData.team}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '16px'
              }}
              placeholder="e.g., 5"
            />
          </div>

          {/* Button */}
          <button 
            onClick={calculateSavings} 
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
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ✨ Calculate Savings ✨
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: '30px',
            padding: '25px',
            background: result.savings > 0 ? '#fff3cd' : '#d4edda',
            borderRadius: '15px',
            border: `2px solid ${result.savings > 0 ? '#ffc107' : '#28a745'}`,
            animation: 'fadeIn 0.5s'
          }}>
            {result.savings > 0 ? (
              <>
                <div style={{textAlign: 'center', fontSize: '48px', marginBottom: '10px'}}>
                  🎉 💰 🎉
                </div>
                <h2 style={{
                  textAlign: 'center',
                  fontSize: '32px',
                  margin: '0',
                  color: '#856404'
                }}>
                  Save {result.suggestion}/month!
                </h2>
                <p style={{
                  textAlign: 'center',
                  fontSize: '18px',
                  marginTop: '15px',
                  color: '#856404'
                }}>
                  {result.recommendation}
                </p>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '10px',
                  marginTop: '20px',
                  textAlign: 'center'
                }}>
                  <p style={{margin: '0 0 10px 0'}}>📧 Want detailed breakdown?</p>
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    style={{
                      padding: '10px',
                      width: '80%',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      marginBottom: '10px'
                    }}
                  />
                  <button style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Send Report →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{textAlign: 'center', fontSize: '48px'}}>
                  🌟 🎯 🌟
                </div>
                <h2 style={{
                  textAlign: 'center',
                  fontSize: '28px',
                  margin: '0',
                  color: '#155724'
                }}>
                  {result.recommendation}
                </h2>
                <p style={{
                  textAlign: 'center',
                  marginTop: '15px',
                  color: '#155724'
                }}>
                  You're spending efficiently!
                </p>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0',
          color: '#999',
          fontSize: '14px'
        }}>
          <p>🔒 Free tool • No credit card required</p>
        </div>
      </div>

      {/* Add animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  )
}

export default App