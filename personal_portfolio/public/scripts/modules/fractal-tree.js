export class FractalTree {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.branchPositions = new Map(); // Store actual positions for connection points
                this.clickableAreas = []; // Store clickable areas for branches
                this.animationId = null;
                this.startTime = Date.now();
                this.isFullscreen = false;
                
                // 3D parameters
                this.rotationY = 0; // Y-axis rotation for 3D effect
                this.rotationSpeed = 0.003; // Slower rotation
                this.is3D = true; // 3D mode toggle
                this.showLetters = true; // Show floating letters toggle
                
                // Camera parameters
                this.cameraDistance = 800; // Camera distance
                this.cameraOffsetX = 0; // Camera X offset
                this.cameraOffsetY = 0; // Camera Y offset
                this.cameraAngleX = 0; // Camera X rotation (pitch)
                this.cameraAngleY = 0; // Camera Y rotation (yaw)
                this.cameraAngleZ = 0; // Camera Z rotation (roll)
                
                // Animated level cycling for fullscreen mode
                this.levelCycleStart = Date.now(); // Start time for level cycling
                this.currentFullscreenLevel = 1; // Current level in fullscreen mode

                // Hero section depth (controlled by scroll)
                this.heroDepth = 1; // Depth for hero section (1-3)

                // Mouse control for branch behavior
                this.mouseX = 0; // Current mouse X position for rotation
                this.mouseY = 0; // Current mouse Y position for branch angle

                // Target values (where we want to go)
                this.targetBranchAngleOffset = 0; // Target angle offset
                this.targetBranchAngle = Math.PI/2; // Target branch angle

                // Current values (smoothly interpolated)
                this.branchAngleOffset = 0; // Angle offset based on mouse X position (0-360 degrees)
                this.branchAngle = Math.PI/2; // Branch angle based on mouse Y position (0-180 degrees)

                // Smoothing factor (0-1, higher = more responsive but less smooth)
                this.smoothingFactor = 0.15; // Adjust for smoothness vs responsiveness
                
                // Branch URLs - customize these as needed
                this.branchUrls = {
                    0: '/natsu/', // Left branch (XY plane)
                    1: '/fixus/', // Right branch (XY plane)
                    2: '/angis/', // Forward branch (XZ plane)
                    3: 'https://github.com/mtdnot' // Backward branch (XZ plane)
                };
                
                this.setupCanvas();
                this.animate(); // Start animation
                this.setupClickHandler();
                this.setupFullscreenHandler();
                this.setupMouseControl();
                this.setupControlPanel();
                
                window.addEventListener('resize', () => {
                    this.setupCanvas();
                });
            }
            
            setupCanvas() {
                // Check if canvas is in hero section (full screen mode)
                const isInHeroSection = this.canvas.closest('.hero-section') !== null;

                if (this.isFullscreen || isInHeroSection) {
                    // Fullscreen or Hero mode - use full viewport
                    const maxWidth = window.innerWidth;
                    const maxHeight = window.innerHeight;

                    this.canvas.width = maxWidth;
                    this.canvas.height = maxHeight;
                    this.canvas.style.width = maxWidth + 'px';
                    this.canvas.style.height = maxHeight + 'px';

                    this.trunkHeight = maxHeight * 0.3;
                    this.trunkWidth = Math.max(maxWidth * 0.003, 8);
                    this.baseX = maxWidth / 2;
                    this.baseY = maxHeight - 50;
                } else {
                    // Normal mode (small card)
                    const container = this.canvas.parentElement;
                    const containerRect = container.getBoundingClientRect();
                    const isMobile = window.innerWidth <= 768;

                    // Use container width with some padding
                    const maxWidth = Math.min(containerRect.width - 20, isMobile ? 350 : 500);
                    const maxHeight = Math.min(window.innerHeight * 0.4, isMobile ? 250 : 400);

                    const aspectRatio = 4/3;
                    let width = maxWidth;
                    let height = width / aspectRatio;

                    if (height > maxHeight) {
                        height = maxHeight;
                        width = height * aspectRatio;
                    }

                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.canvas.style.width = width + 'px';
                    this.canvas.style.height = height + 'px';

                    this.trunkHeight = height * 0.45;
                    this.trunkWidth = Math.max(width * 0.005, isMobile ? 3 : 6);
                    this.baseX = width / 2;
                    this.baseY = height - 30;
                }
            }
            
            setupFullscreenHandler() {
                // Click on canvas (but not on branches) to enter fullscreen
                this.canvas.addEventListener('click', (event) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    // Check if click is on any branch
                    let clickedBranch = false;
                    for (const area of this.clickableAreas) {
                        if (this.isPointInBranch(x, y, area)) {
                            // Branch click - only navigate URL in fullscreen mode
                            if (this.isFullscreen) {
                                const url = this.branchUrls[area.branchId];
                                if (url) {
                                    if (url.startsWith('http')) {
                                        window.open(url, '_blank');
                                    } else {
                                        window.location.href = url;
                                    }
                                }
                            }
                            clickedBranch = true;
                            break;
                        }
                    }

                    // If not clicking on branch and not in fullscreen, enter fullscreen
                    if (!clickedBranch && !this.isFullscreen) {
                        this.enterFullscreen();
                    }
                });
                
                // ESC key to exit fullscreen
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape' && this.isFullscreen) {
                        this.exitFullscreen();
                    }
                });
            }
            
            enterFullscreen() {
                this.isFullscreen = true;
                this.levelCycleStart = Date.now(); // Reset level cycling when entering fullscreen
                this.currentFullscreenLevel = 1; // Start from level 1
                document.body.classList.add('fullscreen');
                
                // Create fullscreen container
                const fullscreenContainer = document.createElement('div');
                fullscreenContainer.className = 'fullscreen-tree';
                
                // Create exit button
                const exitButton = document.createElement('div');
                exitButton.className = 'exit-button';
                exitButton.innerHTML = '×';
                exitButton.addEventListener('click', () => this.exitFullscreen());
                
                // Move canvas to fullscreen container
                const originalParent = this.canvas.parentElement;
                fullscreenContainer.appendChild(this.canvas);
                document.body.appendChild(fullscreenContainer);
                document.body.appendChild(exitButton);
                
                // Store original parent for restoration
                this.originalParent = originalParent;
                this.fullscreenContainer = fullscreenContainer;
                this.exitButton = exitButton;
                
                // Resize canvas for fullscreen
                this.setupCanvas();
            }
            
            exitFullscreen() {
                this.isFullscreen = false;
                document.body.classList.remove('fullscreen');
                
                // Restore canvas to original location
                this.originalParent.appendChild(this.canvas);
                
                // Remove fullscreen elements
                if (this.fullscreenContainer) {
                    this.fullscreenContainer.remove();
                }
                if (this.exitButton) {
                    this.exitButton.remove();
                }
                
                // Resize canvas back to normal
                this.setupCanvas();
            }
            
            // 3D to 2D projection
            project3D(x, y, z) {
                if (!this.is3D) {
                    // 2D mode: simple orthographic projection
                    return {
                        x: this.baseX + x + this.cameraOffsetX,
                        y: this.baseY + y + this.cameraOffsetY,
                        z: z,
                        scale: 1.0
                    };
                }
                
                // 3D mode: perspective projection with camera rotation
                let rotX = x, rotY = y, rotZ = z;
                
                // Apply automatic Y rotation
                const cosY = Math.cos(this.rotationY);
                const sinY = Math.sin(this.rotationY);
                const tempX = rotX * cosY - rotZ * sinY;
                rotZ = rotX * sinY + rotZ * cosY;
                rotX = tempX;
                
                // Apply camera angle rotations
                // X rotation (pitch)
                if (this.cameraAngleX !== 0) {
                    const cosX = Math.cos(this.cameraAngleX);
                    const sinX = Math.sin(this.cameraAngleX);
                    const tempY = rotY * cosX - rotZ * sinX;
                    rotZ = rotY * sinX + rotZ * cosX;
                    rotY = tempY;
                }
                
                // Y rotation (yaw) - additional to automatic rotation
                if (this.cameraAngleY !== 0) {
                    const cosY2 = Math.cos(this.cameraAngleY);
                    const sinY2 = Math.sin(this.cameraAngleY);
                    const tempX2 = rotX * cosY2 - rotZ * sinY2;
                    rotZ = rotX * sinY2 + rotZ * cosY2;
                    rotX = tempX2;
                }
                
                // Z rotation (roll)
                if (this.cameraAngleZ !== 0) {
                    const cosZ = Math.cos(this.cameraAngleZ);
                    const sinZ = Math.sin(this.cameraAngleZ);
                    const tempX3 = rotX * cosZ - rotY * sinZ;
                    rotY = rotX * sinZ + rotY * cosZ;
                    rotX = tempX3;
                }
                
                // Perspective projection with adjustable camera distance
                const scale = this.cameraDistance / (this.cameraDistance + rotZ + 200);
                
                return {
                    x: this.baseX + rotX * scale * 0.8 + this.cameraOffsetX,
                    y: this.baseY + rotY * scale * 0.8 + this.cameraOffsetY,
                    z: rotZ,
                    scale: Math.max(scale * 0.8, 0.3)
                };
            }

            // Pure 2D fractal unit: draws a single branch with 2 sub-branches at 180° (2D only)
            draw2DFractalUnit(centerX, centerY, scale, time, branchId, parentAngle = null, depth = 0) {
                const branchLength = this.trunkHeight * scale;
                const branchThickness = this.trunkWidth * scale;
                
                const branchEndpoints = [];
                
                // Determine trunk angle
                let trunkAngle;
                let trunkStartX = centerX;
                let trunkStartY = centerY;
                let trunkEndX, trunkEndY;
                
                if (parentAngle !== null) {
                    // Sub-fractal: no trunk, branches start directly from parent endpoint
                    trunkAngle = parentAngle;
                    trunkEndX = centerX;
                    trunkEndY = centerY;
                } else {
                    // Root fractal: draw vertical trunk
                    trunkAngle = -Math.PI/2; // Point upward
                    trunkEndX = centerX;
                    trunkEndY = centerY - branchLength; // Move up
                    
                    // Draw trunk
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.baseX + trunkStartX + this.cameraOffsetX, 
                                   this.baseY + trunkStartY + this.cameraOffsetY);
                    this.ctx.lineTo(this.baseX + trunkEndX + this.cameraOffsetX, 
                                   this.baseY + trunkEndY + this.cameraOffsetY);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = branchThickness;
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                }
                
                // Create 2 branches at 180° angles in pure 2D
                // Use same direction as 3D mode: larger angle = more open
                const branchAngle = Math.PI - this.branchAngle; // Invert to match 3D behavior
                
                for (let i = 0; i < 2; i++) {
                    // Calculate branch angle (180° apart)
                    const side = (i === 0) ? 1 : -1;
                    const finalBranchAngle = trunkAngle + (branchAngle * side);
                    
                    // Calculate branch end position in pure 2D with CONSTANT length
                    const branchEndX = trunkEndX + Math.cos(finalBranchAngle) * branchLength;
                    const branchEndY = trunkEndY + Math.sin(finalBranchAngle) * branchLength;
                    
                    // Draw branch
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.baseX + trunkEndX + this.cameraOffsetX, 
                                   this.baseY + trunkEndY + this.cameraOffsetY);
                    this.ctx.lineTo(this.baseX + branchEndX + this.cameraOffsetX, 
                                   this.baseY + branchEndY + this.cameraOffsetY);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = branchThickness;
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                    
                    // Store endpoint for sub-fractal
                    branchEndpoints.push({
                        x: branchEndX,
                        y: branchEndY,
                        branchId: branchId * 10 + i,
                        angle: finalBranchAngle // Pass angle instead of direction
                    });
                    
                    // Store clickable area only for root level
                    if (scale === 1.0) {
                        this.clickableAreas.push({
                            branchId: i,
                            startX: this.baseX + trunkEndX + this.cameraOffsetX,
                            startY: this.baseY + trunkEndY + this.cameraOffsetY,
                            endX: this.baseX + branchEndX + this.cameraOffsetX,
                            endY: this.baseY + branchEndY + this.cameraOffsetY,
                            clickRadius: Math.max(15, branchThickness * 3)
                        });
                        
                        // Store branch tip position for letter drawing (only at leaf nodes)
                        if (!this.branchTips) this.branchTips = [];
                        // Only add letters at the maximum depth (leaf nodes)
                        const currentMaxDepth = this.isFullscreen ? this.currentFullscreenLevel : 1;
                        if (depth === currentMaxDepth - 1) {
                            this.branchTips.push({ 
                                position: {
                                    x: this.baseX + branchEndX + this.cameraOffsetX,
                                    y: this.baseY + branchEndY + this.cameraOffsetY,
                                    scale: 1.0
                                }, 
                                index: i 
                            });
                        }
                    }
                }
                
                return branchEndpoints;
            }

            // Base fractal unit: draws a single branch with 4 sub-branches
            drawBaseFractalUnit(centerX, centerY, centerZ, scale, time, branchId, parentDirection = null, depth = 0) {
                // Define the base unit: one trunk with 4 branches
                const branchLength = this.trunkHeight * scale;
                const branchThickness = this.trunkWidth * scale;
                
                // Store branch endpoints for sub-fractals
                const branchEndpoints = [];
                
                // For root fractal, draw trunk; for sub-fractals, only draw branches from the connection point
                let trunkTopX = centerX;
                let trunkTopY = centerY;
                let trunkTopZ = centerZ;
                let trunkDirection;
                
                if (parentDirection) {
                    // Sub-fractal: no trunk, branches start directly from parent endpoint
                    trunkDirection = parentDirection;
                } else {
                    // Root fractal: draw trunk pointing upward
                    trunkDirection = { x: 0, y: -1, z: 0 };
                    
                    // Calculate trunk end position
                    const trunkEndX = centerX + trunkDirection.x * branchLength;
                    const trunkEndY = centerY + trunkDirection.y * branchLength;
                    const trunkEndZ = centerZ + trunkDirection.z * branchLength;
                    
                    // Draw trunk aligned with its direction
                    const trunkStartProj = this.project3D(centerX, centerY, centerZ);
                    const trunkEndProj = this.project3D(trunkEndX, trunkEndY, trunkEndZ);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(trunkStartProj.x, trunkStartProj.y);
                    this.ctx.lineTo(trunkEndProj.x, trunkEndProj.y);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = branchThickness * Math.min(trunkStartProj.scale, trunkEndProj.scale);
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                    
                    // Set branch origin to trunk end
                    trunkTopX = trunkEndX;
                    trunkTopY = trunkEndY;
                    trunkTopZ = trunkEndZ;
                }
                
                // Create coordinate system relative to trunk direction
                // Only apply mouse X rotation to root level, not sub-fractals
                const angleOffset = parentDirection ? 0 : this.branchAngleOffset; // X-axis rotation only for root
                const branchAngle = this.branchAngle; // Y-axis angle control (0-180°)
                
                // Create local coordinate system with trunk direction as the "up" axis
                let localUp = trunkDirection;
                
                // Create perpendicular vectors to trunk direction
                let localRight, localForward;
                
                if (Math.abs(localUp.y) < 0.9) {
                    // Trunk is not vertical, use cross product with world Y
                    localRight = {
                        x: localUp.z,
                        y: 0,
                        z: -localUp.x
                    };
                } else {
                    // Trunk is nearly vertical, use cross product with world X
                    localRight = {
                        x: 0,
                        y: localUp.z,
                        z: -localUp.y
                    };
                }
                
                // Normalize right vector
                const rightLength = Math.sqrt(localRight.x**2 + localRight.y**2 + localRight.z**2);
                localRight.x /= rightLength;
                localRight.y /= rightLength;
                localRight.z /= rightLength;
                
                // Create forward vector (perpendicular to both up and right)
                localForward = {
                    x: localUp.y * localRight.z - localUp.z * localRight.y,
                    y: localUp.z * localRight.x - localUp.x * localRight.z,
                    z: localUp.x * localRight.y - localUp.y * localRight.x
                };
                
                // Create 4 base directions in local coordinate system
                const baseDirections = [
                    {
                        x: Math.cos(angleOffset) * localRight.x + Math.sin(angleOffset) * localForward.x,
                        y: Math.cos(angleOffset) * localRight.y + Math.sin(angleOffset) * localForward.y,
                        z: Math.cos(angleOffset) * localRight.z + Math.sin(angleOffset) * localForward.z
                    },
                    {
                        x: Math.cos(angleOffset + Math.PI) * localRight.x + Math.sin(angleOffset + Math.PI) * localForward.x,
                        y: Math.cos(angleOffset + Math.PI) * localRight.y + Math.sin(angleOffset + Math.PI) * localForward.y,
                        z: Math.cos(angleOffset + Math.PI) * localRight.z + Math.sin(angleOffset + Math.PI) * localForward.z
                    },
                    {
                        x: Math.cos(angleOffset + Math.PI/2) * localRight.x + Math.sin(angleOffset + Math.PI/2) * localForward.x,
                        y: Math.cos(angleOffset + Math.PI/2) * localRight.y + Math.sin(angleOffset + Math.PI/2) * localForward.y,
                        z: Math.cos(angleOffset + Math.PI/2) * localRight.z + Math.sin(angleOffset + Math.PI/2) * localForward.z
                    },
                    {
                        x: Math.cos(angleOffset + 3*Math.PI/2) * localRight.x + Math.sin(angleOffset + 3*Math.PI/2) * localForward.x,
                        y: Math.cos(angleOffset + 3*Math.PI/2) * localRight.y + Math.sin(angleOffset + 3*Math.PI/2) * localForward.y,
                        z: Math.cos(angleOffset + 3*Math.PI/2) * localRight.z + Math.sin(angleOffset + 3*Math.PI/2) * localForward.z
                    }
                ];
                
                // Apply branch angle relative to trunk direction
                const directions = baseDirections.map(baseDir => {
                    // Mix base direction with trunk direction based on branch angle
                    const trunkComponent = -Math.cos(branchAngle);
                    const radialComponent = Math.sin(branchAngle);
                    
                    return {
                        x: baseDir.x * radialComponent + localUp.x * trunkComponent,
                        y: baseDir.y * radialComponent + localUp.y * trunkComponent,
                        z: baseDir.z * radialComponent + localUp.z * trunkComponent
                    };
                });
                
                for (let i = 0; i < 4; i++) {
                    const dir = directions[i];
                    
                    // No oscillation - static branches
                    let oscDir = { ...dir };
                    
                    const branchEndX = trunkTopX + oscDir.x * branchLength;
                    const branchEndY = trunkTopY + oscDir.y * branchLength;
                    const branchEndZ = trunkTopZ + oscDir.z * branchLength;
                    
                    // Draw branch
                    const branchStartProj = this.project3D(trunkTopX, trunkTopY, trunkTopZ);
                    const branchEndProj = this.project3D(branchEndX, branchEndY, branchEndZ);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(branchStartProj.x, branchStartProj.y);
                    this.ctx.lineTo(branchEndProj.x, branchEndProj.y);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = branchThickness * Math.min(branchStartProj.scale, branchEndProj.scale);
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                    
                    // Store endpoint for sub-fractal with direction information
                    branchEndpoints.push({
                        x: branchEndX,
                        y: branchEndY,
                        z: branchEndZ,
                        branchId: branchId * 10 + i,
                        direction: oscDir // Pass the direction for consistent sub-fractal orientation
                    });
                    
                    // Store clickable area only for root level
                    if (scale === 1.0) {
                        this.clickableAreas.push({
                            branchId: i,
                            startX: branchStartProj.x,
                            startY: branchStartProj.y,
                            endX: branchEndProj.x,
                            endY: branchEndProj.y,
                            clickRadius: Math.max(15, branchThickness * 3)
                        });
                        
                        // Store branch tip position for letter drawing (only at leaf nodes)
                        if (!this.branchTips) this.branchTips = [];
                        // Only add letters at the maximum depth (leaf nodes)
                        const currentMaxDepth = this.isFullscreen ? this.currentFullscreenLevel : 1;
                        if (depth === currentMaxDepth - 1) {
                            this.branchTips.push({ position: branchEndProj, index: i });
                        }
                    }
                }
                
                return branchEndpoints;
            }

            // Recursive 3D fractal drawing function
            draw3DFractal(centerX, centerY, centerZ, scale, depth, maxDepth, time, branchId, parentDirection = null) {
                if (depth >= maxDepth || scale < 0.1) return;
                
                const branchEndpoints = this.drawBaseFractalUnit(centerX, centerY, centerZ, scale, time, branchId, parentDirection, depth);
                
                if (depth < maxDepth) {
                    const newScale = scale * 1.0;
                    
                    branchEndpoints.forEach(endpoint => {
                        this.draw3DFractal(
                            endpoint.x, 
                            endpoint.y, 
                            endpoint.z, 
                            newScale, 
                            depth + 1, 
                            maxDepth, 
                            time, 
                            endpoint.branchId,
                            endpoint.direction
                        );
                    });
                }
            }

            // Recursive 2D fractal drawing function
            draw2DFractal(centerX, centerY, scale, depth, maxDepth, time, branchId, parentAngle = null) {
                if (depth >= maxDepth || scale < 0.1) return;
                
                const branchEndpoints = this.draw2DFractalUnit(centerX, centerY, scale, time, branchId, parentAngle, depth);
                
                if (depth < maxDepth) {
                    const newScale = scale * 1.0;
                    
                    branchEndpoints.forEach(endpoint => {
                        this.draw2DFractal(
                            endpoint.x, 
                            endpoint.y, 
                            newScale, 
                            depth + 1, 
                            maxDepth, 
                            time, 
                            endpoint.branchId,
                            endpoint.angle
                        );
                    });
                }
            }
            
            setupMouseControl() {
                // Function to handle position input (viewport coordinates)
                const handlePositionInput = (viewportX, viewportY) => {
                    // Update mouse positions (viewport-relative)
                    this.mouseX = viewportX;
                    this.mouseY = viewportY;

                    // Convert X position to rotation angle (0-360 degrees)
                    // Left side = 0°, right side = 360°
                    const normalizedX = viewportX / window.innerWidth; // 0 to 1
                    this.targetBranchAngleOffset = normalizedX * 2 * Math.PI; // 0 to 2π radians

                    // Convert Y position to branch angle (0-180 degrees)
                    // Top = 180°, bottom = 0° (reversed)
                    const normalizedY = viewportY / window.innerHeight; // 0 to 1
                    this.targetBranchAngle = (1 - normalizedY) * Math.PI; // π to 0 radians (180-0 degrees)
                };

                // Function to check cursor and branch hover (canvas-relative)
                const updateCursor = (canvasX, canvasY) => {
                    // Only show pointer cursor on branches in fullscreen mode
                    if (this.isFullscreen) {
                        let overBranch = false;
                        for (const area of this.clickableAreas) {
                            if (this.isPointInBranch(canvasX, canvasY, area)) {
                                overBranch = true;
                                break;
                            }
                        }
                        this.canvas.style.cursor = overBranch ? 'pointer' : 'default';
                    } else {
                        // Normal mode: pointer cursor to indicate clickable for fullscreen
                        this.canvas.style.cursor = 'pointer';
                    }
                };

                // Mouse events for desktop - window-wide
                document.addEventListener('mousemove', (event) => {
                    // Use viewport coordinates for tree control
                    handlePositionInput(event.clientX, event.clientY);
                });

                // Canvas-specific mousemove for cursor updates
                this.canvas.addEventListener('mousemove', (event) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    updateCursor(x, y);
                });

                // Touch events for mobile - window-wide
                document.addEventListener('touchmove', (event) => {
                    const touch = event.touches[0];
                    handlePositionInput(touch.clientX, touch.clientY);
                }, { passive: true });

                // Touch start event
                document.addEventListener('touchstart', (event) => {
                    const touch = event.touches[0];
                    handlePositionInput(touch.clientX, touch.clientY);
                }, { passive: true });

                // Touch end event for branch link navigation
                this.canvas.addEventListener('touchend', (event) => {
                    event.preventDefault();
                    const rect = this.canvas.getBoundingClientRect();
                    const touch = event.changedTouches[0];
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;

                    // Check if tap is on any branch (only navigate in fullscreen mode)
                    if (this.isFullscreen) {
                        for (const area of this.clickableAreas) {
                            if (this.isPointInBranch(x, y, area)) {
                                // Branch tap - handle URL navigation
                                const url = this.branchUrls[area.branchId];
                                if (url) {
                                    if (url.startsWith('http')) {
                                        window.open(url, '_blank');
                                    } else {
                                        window.location.href = url;
                                    }
                                }
                                break;
                            }
                        }
                    }
                });
            }
            
            setupControlPanel() {
                // Create toggle button
                const toggleButton = document.createElement('div');
                toggleButton.className = 'control-toggle';
                toggleButton.innerHTML = '⚙️';
                
                // Create fullscreen button
                const fullscreenButton = document.createElement('div');
                fullscreenButton.className = 'fullscreen-button';
                fullscreenButton.innerHTML = '⛶';
                
                // Create control panel HTML
                const controlPanel = document.createElement('div');
                controlPanel.className = 'control-panel';
                controlPanel.innerHTML = `
                    <div class="control-group">
                        <label>View</label>
                        <div class="toggle-button ${this.is3D ? 'active' : ''}" id="toggle3D">
                            ${this.is3D ? '3D' : '2D'}
                        </div>
                    </div>
                    <div class="control-group">
                        <label>Letters</label>
                        <div class="toggle-button ${this.showLetters ? 'active' : ''}" id="toggleLetters">
                            ${this.showLetters ? 'ON' : 'OFF'}
                        </div>
                    </div>
                    <div class="control-group">
                        <label>Distance</label>
                        <input type="range" class="range-input" id="cameraDistance" 
                               min="400" max="1200" value="${this.cameraDistance}">
                    </div>
                    <div class="control-group">
                        <label>Cam X</label>
                        <input type="range" class="range-input" id="cameraX" 
                               min="-200" max="200" value="${this.cameraOffsetX}">
                    </div>
                    <div class="control-group">
                        <label>Cam Y</label>
                        <input type="range" class="range-input" id="cameraY" 
                               min="-200" max="200" value="${this.cameraOffsetY}">
                    </div>
                    <div class="control-group">
                        <label>Pitch</label>
                        <input type="range" class="range-input" id="cameraAngleX" 
                               min="-90" max="90" value="${Math.round(this.cameraAngleX * 180 / Math.PI)}">
                    </div>
                    <div class="control-group">
                        <label>Yaw</label>
                        <input type="range" class="range-input" id="cameraAngleY" 
                               min="-180" max="180" value="${Math.round(this.cameraAngleY * 180 / Math.PI)}">
                    </div>
                    <div class="control-group">
                        <label>Roll</label>
                        <input type="range" class="range-input" id="cameraAngleZ" 
                               min="-180" max="180" value="${Math.round(this.cameraAngleZ * 180 / Math.PI)}">
                    </div>
                `;
                
                // Append all to the logo-container
                const logoContainer = this.canvas.parentElement.parentElement;
                logoContainer.appendChild(toggleButton);
                logoContainer.appendChild(fullscreenButton);
                logoContainer.appendChild(controlPanel);
                
                // Toggle functionality
                toggleButton.addEventListener('click', () => {
                    controlPanel.classList.toggle('visible');
                });
                
                // Fullscreen functionality
                fullscreenButton.addEventListener('click', () => {
                    this.enterFullscreen();
                });
                
                // Setup event listeners
                document.getElementById('toggle3D').addEventListener('click', () => {
                    this.is3D = !this.is3D;
                    const button = document.getElementById('toggle3D');
                    button.textContent = this.is3D ? '3D' : '2D';
                    button.className = `toggle-button ${this.is3D ? 'active' : ''}`;
                });
                
                document.getElementById('toggleLetters').addEventListener('click', () => {
                    this.showLetters = !this.showLetters;
                    const button = document.getElementById('toggleLetters');
                    button.textContent = this.showLetters ? 'ON' : 'OFF';
                    button.className = `toggle-button ${this.showLetters ? 'active' : ''}`;
                });
                
                document.getElementById('cameraDistance').addEventListener('input', (e) => {
                    this.cameraDistance = parseInt(e.target.value);
                });
                
                document.getElementById('cameraX').addEventListener('input', (e) => {
                    this.cameraOffsetX = parseInt(e.target.value);
                });
                
                document.getElementById('cameraY').addEventListener('input', (e) => {
                    this.cameraOffsetY = parseInt(e.target.value);
                });
                
                document.getElementById('cameraAngleX').addEventListener('input', (e) => {
                    this.cameraAngleX = parseInt(e.target.value) * Math.PI / 180;
                });
                
                document.getElementById('cameraAngleY').addEventListener('input', (e) => {
                    this.cameraAngleY = parseInt(e.target.value) * Math.PI / 180;
                });
                
                document.getElementById('cameraAngleZ').addEventListener('input', (e) => {
                    this.cameraAngleZ = parseInt(e.target.value) * Math.PI / 180;
                });
            }
            
            setupClickHandler() {
                // Click handler is now integrated into setupMouseControl
                // This function remains for compatibility but mouse handling is above
            }
            
            isPointInBranch(x, y, area) {
                // Check if point is near the line (within clickable radius)
                const dx = area.endX - area.startX;
                const dy = area.endY - area.startY;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length === 0) return false;
                
                // Calculate distance from point to line
                const t = Math.max(0, Math.min(1, ((x - area.startX) * dx + (y - area.startY) * dy) / (length * length)));
                const projection = {
                    x: area.startX + t * dx,
                    y: area.startY + t * dy
                };
                
                const distance = Math.sqrt((x - projection.x) ** 2 + (y - projection.y) ** 2);
                return distance <= area.clickRadius;
            }
            
            drawFloatingLetter(position, branchIndex, time) {
                // Extract text from branch URL
                const url = this.branchUrls[branchIndex] || '';
                let letter = '';
                
                if (url) {
                    // Extract the last path segment from URL
                    const pathMatch = url.match(/\/([^\/]+)\/?$/);
                    if (pathMatch) {
                        letter = pathMatch[1]; // Get the captured group (path name)
                    } else if (url.startsWith('http')) {
                        // For external URLs, try to extract domain or relevant part
                        try {
                            const urlObj = new URL(url);
                            const hostname = urlObj.hostname;
                            // Extract meaningful part (e.g., 'github' from 'github.com')
                            const parts = hostname.split('.');
                            letter = parts[0] || hostname;
                        } catch {
                            letter = 'ext'; // fallback for external links
                        }
                    }
                }
                
                // Fallback if no letter extracted
                if (!letter) {
                    const fallbackLetters = ['n', 'a', 'f', 'x'];
                    letter = fallbackLetters[branchIndex % fallbackLetters.length];
                }
                
                // Add floating animation
                const floatSpeed = 0.002;
                const floatAmplitude = 10;
                const phaseOffset = branchIndex * Math.PI / 2;
                const floatOffset = Math.sin(time * floatSpeed + phaseOffset) * floatAmplitude;
                
                // Position the letter above the branch tip
                const letterX = position.x;
                const letterY = position.y - 25 + floatOffset;
                
                // Add rotation around Y-axis (height axis)
                const rotationSpeed = 0.001;
                const rotationAngle = time * rotationSpeed + branchIndex * Math.PI / 2;
                
                // Save context for transformation
                this.ctx.save();
                
                // Move to letter position
                this.ctx.translate(letterX, letterY);
                
                // Rotate around the vertical axis (simulated by scaling x)
                const scaleX = Math.cos(rotationAngle);
                this.ctx.scale(scaleX, 1);
                
                // Adjust font size based on text length
                const baseFontSize = Math.max(16, 18 * (position.scale || 1));
                let fontSize = baseFontSize;
                
                // Scale down font for longer text
                if (letter.length > 4) {
                    fontSize = baseFontSize * 0.7;
                } else if (letter.length > 2) {
                    fontSize = baseFontSize * 0.85;
                }
                
                // Thin black letters
                this.ctx.font = `300 ${fontSize}px Arial`;
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * Math.abs(scaleX)})`; // Fade when rotating
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Draw the letter at origin (0,0) since we translated
                this.ctx.fillText(letter, 0, 0);
                
                // Restore context
                this.ctx.restore();
            }

            draw() {
                const time = Date.now() - this.startTime;

                // Smooth interpolation (lerp) for branch angles
                // This makes touch/mouse movements smooth instead of jerky
                this.branchAngleOffset += (this.targetBranchAngleOffset - this.branchAngleOffset) * this.smoothingFactor;
                this.branchAngle += (this.targetBranchAngle - this.branchAngle) * this.smoothingFactor;

                // Update 3D rotation (only in 3D mode)
                if (this.is3D) {
                    this.rotationY += this.rotationSpeed;
                }

                // Update level cycling for fullscreen mode
                if (this.isFullscreen) {
                    const cycleTime = Date.now() - this.levelCycleStart;
                    const cycleInterval = 3000; // 3 seconds per level
                    const currentCycle = Math.floor(cycleTime / cycleInterval);
                    this.currentFullscreenLevel = (currentCycle % 5) + 1; // Cycle between 1, 2, 3, 4, 5
                }
                
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.branchPositions.clear();
                this.clickableAreas = []; // Reset clickable areas
                this.branchTips = []; // Reset branch tips for letter drawing

                // Draw fractal tree starting from base position
                // Check if canvas is in hero section
                const isInHeroSection = this.canvas.closest('.hero-section') !== null;
                const maxDepthLimit = this.isFullscreen ? this.currentFullscreenLevel :
                                     (isInHeroSection ? this.heroDepth : 1);
                
                if (this.is3D) {
                    // 3D mode: use 3D fractal function
                    this.draw3DFractal(
                        0, // X centered at origin
                        0, // Y starts at origin  
                        0, // Z at origin
                        1.0, // Full scale for root
                        0, // Starting depth
                        maxDepthLimit, // Dynamic depth based on mode
                        time,
                        1 // Root fractal ID
                    );
                } else {
                    // 2D mode: use pure 2D fractal function
                    this.draw2DFractal(
                        0, // X centered at origin
                        0, // Y starts at origin
                        1.0, // Full scale for root
                        0, // Starting depth
                        maxDepthLimit, // Dynamic depth based on mode
                        time,
                        1 // Root fractal ID
                    );
                }
                
                // Draw letters after all branches are drawn
                if (this.showLetters && this.branchTips) {
                    this.branchTips.forEach((tip) => {
                        this.drawFloatingLetter(tip.position, tip.index, time);
                    });
                }
            }
            
            animate() {
                this.draw();
                this.animationId = requestAnimationFrame(() => this.animate());
            }
            
            destroy() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            }
            
        }
