const FNG_API = 'https://api.alternative.me/fng/?limit=1';
const fearGreedValue = document.getElementById('fear-greed-value');
const fearGreedLabel = document.getElementById('fear-greed-label');
const sentimentDescription = document.getElementById('sentiment-description');

// Ambil Fear & Greed Index
export async function fetchFearGreedIndex() {
  try {
    const resp = await fetch(FNG_API);
    const result = await resp.json();
    
    if (result.data && result.data.length) {
      const { value, value_classification } = result.data[0];
      const v = parseInt(value, 10);
      
      fearGreedValue.textContent = v;
      fearGreedLabel.textContent = value_classification;
      
      // Perbarui visualisasi gauge
      const gaugeValue = document.querySelector('.gauge-value');
      if (gaugeValue) {
        gaugeValue.style.strokeDashoffset = 534 - (534 * v / 100);
      }
      
      // Perbarui deskripsi sentimen
      sentimentDescription.textContent = 
        v < 25 ? 'Extreme fear can indicate a buying opportunity.' :
        v < 45 ? 'Fear suggests market may be bottoming.' :
        v < 55 ? 'Neutral sentiment.' :
        'Greed is high—exercise caution.';
    }
  } catch (error) {
    console.error('Fear & Greed error:', error);
    fearGreedValue.textContent = 'Error';
    fearGreedLabel.textContent = 'Error';
    sentimentDescription.textContent = 'Failed to fetch sentiment data';
  }
}