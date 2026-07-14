export class PocketWatch {
            constructor() {
                this.watchElement = document.getElementById('pocketWatch');
                this.moonShadow = document.getElementById('moonShadow');
                this.moonPhaseText = document.getElementById('moonPhaseText');
                this.moonDate = document.getElementById('moonDate');
                this.currentTime = document.getElementById('currentTime');
                
                this.hourHand = document.getElementById('hourHand');
                this.minuteHand = document.getElementById('minuteHand');
                this.secondHand = document.getElementById('secondHand');
                
                this.initializeClockNumbers();
                this.updateTime();
                this.updateMoonPhase();
                
                // Update time every second
                setInterval(() => this.updateTime(), 1000);
                
                // Update moon phase every hour
                setInterval(() => this.updateMoonPhase(), 3600000);
                
                // Add click event to show more details
                this.watchElement.addEventListener('click', () => {
                    this.showWatchDetails();
                });
            }
            
            // Initialize clock face numbers
            initializeClockNumbers() {
                const numbersContainer = document.getElementById('clockNumbers');
                const positions = [
                    { index: 0, content: 'XII', type: 'roman' },  // 12
                    { index: 1, content: '', type: 'marker' },    // 1
                    { index: 2, content: '', type: 'marker' },    // 2
                    { index: 3, content: '', type: 'marker' },    // 3
                    { index: 4, content: '', type: 'marker' },    // 4
                    { index: 5, content: '', type: 'marker' },    // 5
                    { index: 6, content: 'VI', type: 'roman' },   // 6
                    { index: 7, content: '', type: 'marker' },    // 7
                    { index: 8, content: '', type: 'marker' },    // 8
                    { index: 9, content: '', type: 'marker' },    // 9
                    { index: 10, content: '', type: 'marker' },   // 10
                    { index: 11, content: '', type: 'marker' }    // 11
                ];
                
                positions.forEach((pos) => {
                    const element = document.createElement('div');
                    
                    // Calculate position
                    const angle = (pos.index * 30) - 90; // Start from 12 o'clock
                    const radius = pos.type === 'roman' ? 42 : 45; // Roman numerals closer, markers further
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    
                    if (pos.type === 'roman') {
                        element.className = 'clock-number roman-numeral';
                        element.textContent = pos.content;
                        
                        // Special positioning for VI to avoid moon phase overlap
                        if (pos.index === 6) {
                            const adjustedRadius = 32; // Move VI closer to center
                            const adjustedX = Math.cos(angle * Math.PI / 180) * adjustedRadius;
                            const adjustedY = Math.sin(angle * Math.PI / 180) * adjustedRadius;
                            element.style.left = `calc(50% + ${adjustedX}px - 9px)`;
                            element.style.top = `calc(50% + ${adjustedY}px - 9px)`;
                        } else {
                            element.style.left = `calc(50% + ${x}px - 9px)`;
                            element.style.top = `calc(50% + ${y}px - 9px)`;
                        }
                    } else {
                        element.className = 'minute-marker';
                        element.style.left = `calc(50% + ${x}px - 1px)`;
                        element.style.top = `calc(50% + ${y}px - 4px)`;
                        
                        // Rotate marker to point toward center
                        element.style.transform = `rotate(${angle + 90}deg)`;
                    }
                    
                    numbersContainer.appendChild(element);
                });
            }
            
            // Update clock hands
            updateTime() {
                const now = new Date();
                const hours = now.getHours() % 12;
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                
                // Calculate angles (0 degrees = 12 o'clock, positive rotation is clockwise)
                const secondAngle = seconds * 6; // 6 degrees per second (360/60)
                const minuteAngle = (minutes * 6) + (seconds * 0.1); // 6 degrees per minute + smooth seconds
                const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + smooth minutes
                
                // Apply rotations
                this.hourHand.style.transform = `rotate(${hourAngle}deg)`;
                this.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
                this.secondHand.style.transform = `rotate(${secondAngle}deg)`;
                
                // Update digital time display
                const timeString = now.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                this.currentTime.textContent = timeString;
            }
            
            // Calculate moon phase based on current date
            calculateMoonPhase(date = new Date()) {
                // Known new moon: January 6, 2000, 18:14 UTC
                const knownNewMoon = new Date(2000, 0, 6, 18, 14);
                const lunarCycle = 29.530588853; // days
                
                const daysSinceKnownNewMoon = (date - knownNewMoon) / (24 * 60 * 60 * 1000);
                const phase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
                
                return phase;
            }
            
            // Get moon phase name
            getMoonPhaseName(phase) {
                if (phase < 0.0625) return 'New Moon';
                if (phase < 0.1875) return 'Waxing Crescent';
                if (phase < 0.3125) return 'First Quarter';
                if (phase < 0.4375) return 'Waxing Gibbous';
                if (phase < 0.5625) return 'Full Moon';
                if (phase < 0.6875) return 'Waning Gibbous';
                if (phase < 0.8125) return 'Last Quarter';
                if (phase < 0.9375) return 'Waning Crescent';
                return 'New Moon';
            }
            
            // Calculate next moon phase
            getNextMoonPhase(currentPhase) {
                const phases = [
                    { name: 'New Moon', phase: 0 },
                    { name: 'First Quarter', phase: 0.25 },
                    { name: 'Full Moon', phase: 0.5 },
                    { name: 'Last Quarter', phase: 0.75 }
                ];
                
                const lunarCycle = 29.530588853;
                
                for (let phase of phases) {
                    let nextPhase = phase.phase;
                    if (nextPhase <= currentPhase) {
                        nextPhase += 1; // Next cycle
                    }
                    
                    const daysToNext = (nextPhase - currentPhase) * lunarCycle;
                    const nextDate = new Date();
                    nextDate.setDate(nextDate.getDate() + daysToNext);
                    
                    return {
                        name: phase.name,
                        date: nextDate,
                        days: Math.round(daysToNext)
                    };
                }
            }
            
            // Update visual representation
            updateMoonPhase() {
                const now = new Date();
                const phase = this.calculateMoonPhase(now);
                const phaseName = this.getMoonPhaseName(phase);
                
                // Update text
                this.moonPhaseText.textContent = phaseName;
                this.moonDate.textContent = now.toLocaleDateString('ja-JP', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                // Update visual representation
                this.updateMoonVisual(phase);
            }
            
            // Update moon visual based on phase
            updateMoonVisual(phase) {
                const shadowElement = this.moonShadow;
                
                if (phase < 0.5) {
                    // Waxing: shadow moves from right to left
                    const shadowWidth = (0.5 - phase) * 200; // 0-100%
                    shadowElement.style.right = '0px';
                    shadowElement.style.left = 'auto';
                    shadowElement.style.width = `${shadowWidth}%`;
                    shadowElement.style.borderRadius = shadowWidth > 50 ? '50%' : `0 50% 50% 0`;
                } else {
                    // Waning: shadow moves from left to right
                    const shadowWidth = (phase - 0.5) * 200; // 0-100%
                    shadowElement.style.left = '0px';
                    shadowElement.style.right = 'auto';
                    shadowElement.style.width = `${shadowWidth}%`;
                    shadowElement.style.borderRadius = shadowWidth > 50 ? '50%' : `50% 0 0 50%`;
                }
                
                // Special cases for new and full moon
                if (phase < 0.05 || phase > 0.95) {
                    // New moon: completely dark
                    shadowElement.style.width = '100%';
                    shadowElement.style.borderRadius = '50%';
                } else if (phase > 0.45 && phase < 0.55) {
                    // Full moon: no shadow
                    shadowElement.style.width = '0%';
                }
            }
            
            // Show detailed watch information
            showWatchDetails() {
                const now = new Date();
                const phase = this.calculateMoonPhase(now);
                const phaseName = this.getMoonPhaseName(phase);
                const nextPhase = this.getNextMoonPhase(phase);
                const illumination = Math.round(Math.sin(phase * Math.PI) * 100 * 100) / 100;
                
                const timeString = now.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                
                const details = `${timeString}
${now.toLocaleDateString('ja-JP', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                })}
${phaseName}
照明度: ${illumination}%
次の${nextPhase.name}: ${nextPhase.days}日後`;
                
                alert(details);
            }
        }

        // Second Pocket Watch Class (Reverse Time)
export class ReversePocketWatch {
            constructor() {
                this.watchElement = document.getElementById('pocketWatch2');
                this.currentTime = document.getElementById('currentTime2');
                
                this.hourHand = document.getElementById('hourHand2');
                this.minuteHand = document.getElementById('minuteHand2');
                this.secondHand = document.getElementById('secondHand2');
                
                this.initializeClockNumbers();
                this.updateTime();
                
                // Update time more frequently for smooth animation
                setInterval(() => this.updateTime(), 50); // 20 FPS for smooth movement
                
                // Add click event to show more details
                this.watchElement.addEventListener('click', () => {
                    this.showWatchDetails();
                });
            }
            
            // Initialize clock face numbers (same as regular watch)
            initializeClockNumbers() {
                const numbersContainer = document.getElementById('clockNumbers2');
                const positions = [
                    { index: 0, content: 'XII', type: 'roman' },  // 12
                    { index: 1, content: '', type: 'marker' },    // 1
                    { index: 2, content: '', type: 'marker' },    // 2
                    { index: 3, content: '', type: 'marker' },    // 3
                    { index: 4, content: '', type: 'marker' },    // 4
                    { index: 5, content: '', type: 'marker' },    // 5
                    { index: 6, content: 'VI', type: 'roman' },   // 6
                    { index: 7, content: '', type: 'marker' },    // 7
                    { index: 8, content: '', type: 'marker' },    // 8
                    { index: 9, content: '', type: 'marker' },    // 9
                    { index: 10, content: '', type: 'marker' },   // 10
                    { index: 11, content: '', type: 'marker' }    // 11
                ];
                
                positions.forEach((pos) => {
                    const element = document.createElement('div');
                    
                    // Calculate position
                    const angle = (pos.index * 30) - 90; // Start from 12 o'clock
                    const radius = pos.type === 'roman' ? 42 : 45; // Roman numerals closer, markers further
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    
                    if (pos.type === 'roman') {
                        element.className = 'clock-number roman-numeral';
                        element.textContent = pos.content;
                        element.style.left = `calc(50% + ${x}px - 9px)`;
                        element.style.top = `calc(50% + ${y}px - 9px)`;
                    } else {
                        element.className = 'minute-marker';
                        element.style.left = `calc(50% + ${x}px - 1px)`;
                        element.style.top = `calc(50% + ${y}px - 4px)`;
                        
                        // Rotate marker to point toward center
                        element.style.transform = `rotate(${angle + 90}deg)`;
                    }
                    
                    numbersContainer.appendChild(element);
                });
            }
            
            // Update clock hands with reverse rotation
            updateTime() {
                const now = new Date();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const milliseconds = now.getMilliseconds();
                
                // Hour hand fixed at 12 o'clock (0 degrees)
                const hourAngle = 0;
                
                // Continuous reverse rotation without jumping
                if (!this.totalRotation) {
                    this.totalRotation = 0;
                }
                
                // Calculate how much time has passed since last update
                const currentTime = Date.now();
                if (!this.lastUpdateTime) {
                    this.lastUpdateTime = currentTime;
                }
                
                const deltaTime = currentTime - this.lastUpdateTime;
                this.lastUpdateTime = currentTime;
                
                // Add rotation based on time elapsed (72 degrees per second, counterclockwise)
                const rotationSpeed = -72; // degrees per second, negative for counterclockwise
                this.totalRotation += (rotationSpeed * deltaTime) / 1000;
                
                // Second hand: 5 seconds per rotation
                const secondAngle = this.totalRotation;
                
                // Minute hand: 1/60 of second hand speed (5 minutes per rotation)
                const minuteAngle = this.totalRotation / 60;
                
                // Apply rotations
                this.hourHand.style.transform = `rotate(${hourAngle}deg)`;
                this.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
                this.secondHand.style.transform = `rotate(${secondAngle}deg)`;
                
                // Update digital time display
                const timeString = now.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                this.currentTime.textContent = timeString;
            }
            
            // Show detailed watch information
            showWatchDetails() {
                const now = new Date();
                const timeString = now.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                
                const details = `${timeString}
${now.toLocaleDateString('ja-JP', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                })}
逆回転時計
短針固定・長針/秒針逆回転`;
                
                alert(details);
            }
        }

        // Stopped Pocket Watch Class (Fixed at 12:00)
export class StoppedPocketWatch {
            constructor() {
                this.watchElement = document.getElementById('pocketWatch3');
                this.currentTime = document.getElementById('currentTime3');
                
                this.hourHand = document.getElementById('hourHand3');
                this.minuteHand = document.getElementById('minuteHand3');
                this.secondHand = document.getElementById('secondHand3');
                
                this.initializeClockNumbers();
                this.setFixedTime();
                
                // Add click event to show more details
                this.watchElement.addEventListener('click', () => {
                    this.showWatchDetails();
                });
            }
            
            // Initialize clock face numbers (same as other watches)
            initializeClockNumbers() {
                const numbersContainer = document.getElementById('clockNumbers3');
                const positions = [
                    { index: 0, content: 'XII', type: 'roman' },  // 12
                    { index: 1, content: '', type: 'marker' },    // 1
                    { index: 2, content: '', type: 'marker' },    // 2
                    { index: 3, content: '', type: 'marker' },    // 3
                    { index: 4, content: '', type: 'marker' },    // 4
                    { index: 5, content: '', type: 'marker' },    // 5
                    { index: 6, content: 'VI', type: 'roman' },   // 6
                    { index: 7, content: '', type: 'marker' },    // 7
                    { index: 8, content: '', type: 'marker' },    // 8
                    { index: 9, content: '', type: 'marker' },    // 9
                    { index: 10, content: '', type: 'marker' },   // 10
                    { index: 11, content: '', type: 'marker' }    // 11
                ];
                
                positions.forEach((pos) => {
                    const element = document.createElement('div');
                    
                    // Calculate position
                    const angle = (pos.index * 30) - 90; // Start from 12 o'clock
                    const radius = pos.type === 'roman' ? 42 : 45; // Roman numerals closer, markers further
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    
                    if (pos.type === 'roman') {
                        element.className = 'clock-number roman-numeral';
                        element.textContent = pos.content;
                        element.style.left = `calc(50% + ${x}px - 9px)`;
                        element.style.top = `calc(50% + ${y}px - 9px)`;
                    } else {
                        element.className = 'minute-marker';
                        element.style.left = `calc(50% + ${x}px - 1px)`;
                        element.style.top = `calc(50% + ${y}px - 4px)`;
                        
                        // Rotate marker to point toward center
                        element.style.transform = `rotate(${angle + 90}deg)`;
                    }
                    
                    numbersContainer.appendChild(element);
                });
            }
            
            // Set clock hands to 12:00 position (0 degrees = 12 o'clock)
            setFixedTime() {
                const fixedAngle = 0; // All hands point to 12 o'clock
                
                // Apply fixed rotations
                this.hourHand.style.transform = `rotate(${fixedAngle}deg)`;
                this.minuteHand.style.transform = `rotate(${fixedAngle}deg)`;
                this.secondHand.style.transform = `rotate(${fixedAngle}deg)`;
                
                // Set digital time display to 12:00:00
                this.currentTime.textContent = '12:00:00';
            }
            
            // Show detailed watch information
            showWatchDetails() {
                const details = `12:00:00
固定時刻
止まった時計
すべての針が12時を指している`;
                
                alert(details);
            }
        }
