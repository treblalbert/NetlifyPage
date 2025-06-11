import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from PIL import Image, ImageTk
import os
import threading
import time

class ASCIIArtConverter:
    def __init__(self, root):
        self.root = root
        self.root.title("🎨 ASCII Art Converter")
        self.root.geometry("1400x900")
        
        # Set color scheme
        self.colors = {
            'bg': '#2C3E50',           # Dark blue-gray
            'frame_bg': '#34495E',     # Slightly lighter blue-gray
            'accent': '#3498DB',       # Bright blue
            'success': '#27AE60',      # Green
            'warning': '#F39C12',      # Orange
            'danger': '#E74C3C',       # Red
            'text': '#ECF0F1',         # Light gray
            'button': '#3498DB',       # Blue
            'button_hover': '#2980B9'  # Darker blue
        }
        
        # Configure root background
        self.root.configure(bg=self.colors['bg'])
        
        # ASCII characters from darkest to lightest
        self.ascii_chars = "@%#*+=-:. "
        
        # Variables
        self.image_path = None
        self.original_image = None
        self.ascii_art = ""
        self.black_as_space = tk.BooleanVar(value=False)
        
        # Animation variables
        self.is_animated = False
        self.ascii_frames = []
        self.current_frame = 0
        self.animation_running = False
        self.animation_speed = tk.DoubleVar(value=100)
        self.animation_thread = None
        self.frame_durations = []
        
        self.setup_styles()
        self.setup_ui()
    
    def setup_styles(self):
        """Configure custom styles for ttk widgets"""
        style = ttk.Style()
        
        # Configure frame styles
        style.configure('Card.TLabelframe', 
                       background=self.colors['frame_bg'],
                       foreground=self.colors['text'],
                       borderwidth=2,
                       relief='raised')
        style.configure('Card.TLabelframe.Label',
                       background=self.colors['frame_bg'],
                       foreground=self.colors['accent'],
                       font=('Segoe UI', 10, 'bold'))
        
        # Configure button styles
        style.configure('Accent.TButton',
                       background=self.colors['button'],
                       foreground='white',
                       font=('Segoe UI', 9, 'bold'),
                       padding=(10, 5))
        
        style.configure('Success.TButton',
                       background=self.colors['success'],
                       foreground='white',
                       font=('Segoe UI', 9, 'bold'),
                       padding=(8, 4))
        
        style.configure('Warning.TButton',
                       background=self.colors['warning'],
                       foreground='white',
                       font=('Segoe UI', 9, 'bold'),
                       padding=(8, 4))
        
        style.configure('Danger.TButton',
                       background=self.colors['danger'],
                       foreground='white',
                       font=('Segoe UI', 9, 'bold'),
                       padding=(8, 4))
        
        # Configure label styles
        style.configure('Custom.TLabel',
                       background=self.colors['frame_bg'],
                       foreground=self.colors['text'],
                       font=('Segoe UI', 9))
        
        # Configure entry styles
        style.configure('Custom.TEntry',
                       fieldbackground='white',
                       borderwidth=2,
                       relief='solid')
        
        # Configure checkbutton styles
        style.configure('Custom.TCheckbutton',
                       background=self.colors['frame_bg'],
                       foreground=self.colors['text'],
                       font=('Segoe UI', 9),
                       focuscolor='none')
    
    def setup_ui(self):
        # Main frame with custom background
        main_frame = tk.Frame(self.root, bg=self.colors['bg'], padx=15, pady=15)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title label
        title_label = tk.Label(
            main_frame, 
            text="🎨 ASCII Art Converter",
            font=('Segoe UI', 16, 'bold'),
            bg=self.colors['bg'],
            fg=self.colors['accent']
        )
        title_label.pack(pady=(0, 20))
        
        # Control panel
        self.control_frame = ttk.LabelFrame(
            main_frame, 
            text="🛠️ Controls", 
            style='Card.TLabelframe',
            padding=15
        )
        self.control_frame.pack(fill=tk.X, pady=(0, 15))
        
        # First row of controls
        control_row1 = tk.Frame(self.control_frame, bg=self.colors['frame_bg'])
        control_row1.pack(fill=tk.X, pady=(0, 10))
        
        # Load image button
        load_btn = ttk.Button(
            control_row1, 
            text="📁 Load Image/GIF", 
            command=self.load_image,
            style='Accent.TButton'
        )
        load_btn.pack(side=tk.LEFT, padx=(0, 15))
        
        # Width control
        width_frame = tk.Frame(control_row1, bg=self.colors['frame_bg'])
        width_frame.pack(side=tk.LEFT, padx=(0, 15))
        
        ttk.Label(width_frame, text="📐 Width:", style='Custom.TLabel').pack(side=tk.LEFT, padx=(0, 5))
        self.width_var = tk.StringVar(value="80")
        width_entry = ttk.Entry(width_frame, textvariable=self.width_var, width=8, style='Custom.TEntry')
        width_entry.pack(side=tk.LEFT)
        
        # Convert button
        convert_btn = ttk.Button(
            control_row1, 
            text="✨ Convert to ASCII", 
            command=self.convert_to_ascii,
            style='Accent.TButton'
        )
        convert_btn.pack(side=tk.LEFT, padx=(0, 15))
        
        # Second row of controls
        control_row2 = tk.Frame(self.control_frame, bg=self.colors['frame_bg'])
        control_row2.pack(fill=tk.X, pady=(0, 10))
        
        # Black as space option
        black_space_cb = ttk.Checkbutton(
            control_row2,
            text="⚫ Use spaces for black pixels",
            variable=self.black_as_space,
            style='Custom.TCheckbutton'
        )
        black_space_cb.pack(side=tk.LEFT, padx=(0, 20))
        
        # Save button
        save_btn = ttk.Button(
            control_row2, 
            text="💾 Save ASCII", 
            command=self.save_ascii,
            style='Accent.TButton'
        )
        save_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Copy button
        copy_btn = ttk.Button(
            control_row2, 
            text="📋 Copy to Clipboard", 
            command=self.copy_to_clipboard,
            style='Accent.TButton'
        )
        copy_btn.pack(side=tk.LEFT)
        
        # Animation controls (initially hidden)
        self.animation_frame = ttk.LabelFrame(
            main_frame, 
            text="🎬 Animation Controls", 
            style='Card.TLabelframe',
            padding=15
        )
        
        # Animation control buttons
        anim_buttons_frame = tk.Frame(self.animation_frame, bg=self.colors['frame_bg'])
        anim_buttons_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.play_btn = ttk.Button(
            anim_buttons_frame, 
            text="▶️ Play", 
            command=self.play_animation,
            style='Success.TButton'
        )
        self.play_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.pause_btn = ttk.Button(
            anim_buttons_frame, 
            text="⏸️ Pause", 
            command=self.pause_animation,
            style='Warning.TButton'
        )
        self.pause_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.stop_btn = ttk.Button(
            anim_buttons_frame, 
            text="⏹️ Stop", 
            command=self.stop_animation,
            style='Danger.TButton'
        )
        self.stop_btn.pack(side=tk.LEFT, padx=(0, 20))
        
        # Frame navigation
        self.prev_btn = ttk.Button(
            anim_buttons_frame, 
            text="⏮️ Prev", 
            command=self.prev_frame,
            style='Accent.TButton'
        )
        self.prev_btn.pack(side=tk.LEFT, padx=(0, 5))
        
        self.next_btn = ttk.Button(
            anim_buttons_frame, 
            text="⏭️ Next", 
            command=self.next_frame,
            style='Accent.TButton'
        )
        self.next_btn.pack(side=tk.LEFT, padx=(0, 20))
        
        # Speed control
        speed_frame = tk.Frame(anim_buttons_frame, bg=self.colors['frame_bg'])
        speed_frame.pack(side=tk.LEFT)
        
        ttk.Label(speed_frame, text="🏃 Speed (ms):", style='Custom.TLabel').pack(side=tk.LEFT, padx=(0, 5))
        speed_scale = ttk.Scale(
            speed_frame, 
            from_=50, 
            to=1000, 
            variable=self.animation_speed,
            orient=tk.HORIZONTAL,
            length=150
        )
        speed_scale.pack(side=tk.LEFT, padx=(0, 10))
        
        self.speed_label = ttk.Label(speed_frame, text="100", style='Custom.TLabel')
        self.speed_label.pack(side=tk.LEFT)
        speed_scale.configure(command=self.update_speed_label)
        
        # Frame counter
        self.frame_info = ttk.Label(
            self.animation_frame,
            text="Frame: 0 / 0",
            style='Custom.TLabel',
            font=('Segoe UI', 10, 'bold')
        )
        self.frame_info.pack(pady=(10, 0))
        
        # Content area
        content_frame = tk.Frame(main_frame, bg=self.colors['bg'])
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Image preview frame
        image_frame = ttk.LabelFrame(
            content_frame, 
            text="🖼️ Original Image/GIF", 
            style='Card.TLabelframe',
            padding=15
        )
        image_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        # Image display area with custom background
        image_display_frame = tk.Frame(image_frame, bg='white', relief='sunken', bd=2)
        image_display_frame.pack(fill=tk.BOTH, expand=True)
        
        # Image label
        self.image_label = tk.Label(
            image_display_frame, 
            text="📷\nNo image loaded\nClick 'Load Image/GIF' to start\nSupports: JPG, PNG, GIF, BMP",
            font=('Segoe UI', 12),
            bg='white',
            fg='#7F8C8D',
            justify=tk.CENTER
        )
        self.image_label.pack(expand=True)
        
        # ASCII output frame
        ascii_frame = ttk.LabelFrame(
            content_frame, 
            text="🎭 ASCII Art Output", 
            style='Card.TLabelframe',
            padding=15
        )
        ascii_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # ASCII text widget with custom styling
        text_frame = tk.Frame(ascii_frame, bg=self.colors['frame_bg'])
        text_frame.pack(fill=tk.BOTH, expand=True)
        
        self.ascii_text = scrolledtext.ScrolledText(
            text_frame,
            wrap=tk.NONE,
            font=('Consolas', 8),
            width=60,
            height=30,
            bg='#1E1E1E',
            fg='#00FF00',
            insertbackground='#00FF00',
            selectbackground='#404040',
            relief='sunken',
            bd=2
        )
        self.ascii_text.pack(fill=tk.BOTH, expand=True)
        
        # Status bar
        self.status_bar = tk.Label(
            main_frame,
            text="🚀 Ready to convert images and GIFs to ASCII art!",
            font=('Segoe UI', 9),
            bg=self.colors['accent'],
            fg='white',
            pady=8
        )
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X, pady=(15, 0))
    
    def update_speed_label(self, value):
        """Update the speed label when scale changes"""
        self.speed_label.config(text=f"{int(float(value))}")
    
    def update_status(self, message, color=None):
        """Update status bar message"""
        if color is None:
            color = self.colors['accent']
        self.status_bar.config(text=message, bg=color)
        self.root.update_idletasks()
    
    def load_image(self):
        """Load an image or GIF file"""
        file_types = [
            ("All supported", "*.jpg *.jpeg *.png *.bmp *.gif *.tiff"),
            ("Image files", "*.jpg *.jpeg *.png *.bmp *.tiff"),
            ("GIF files", "*.gif"),
            ("All files", "*.*")
        ]
        
        self.image_path = filedialog.askopenfilename(
            title="Select an image or GIF",
            filetypes=file_types
        )
        
        if self.image_path:
            try:
                self.original_image = Image.open(self.image_path)
                
                # Check if it's an animated GIF
                self.is_animated = getattr(self.original_image, "is_animated", False)
                
                if self.is_animated:
                    self.animation_frame.pack(fill=tk.X, pady=(0, 15), after=self.control_frame)
                    self.update_status(f"🎬 Animated GIF loaded: {self.original_image.n_frames} frames", self.colors['success'])
                else:
                    self.animation_frame.pack_forget()
                    self.update_status(f"✅ Image loaded successfully", self.colors['success'])
                
                self.display_image_preview()
                filename = os.path.basename(self.image_path)
                
            except Exception as e:
                self.update_status(f"❌ Failed to load image: {str(e)}", self.colors['warning'])
                messagebox.showerror("Error", f"Failed to load image: {str(e)}")
    
    def display_image_preview(self):
        """Display a preview of the loaded image"""
        if self.original_image:
            # Create a thumbnail for preview
            preview_image = self.original_image.copy()
            
            # For GIFs, show the first frame
            if self.is_animated:
                preview_image.seek(0)
            
            # Calculate size to fit in the frame while maintaining aspect ratio
            max_size = (400, 400)
            preview_image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to PhotoImage for tkinter
            photo = ImageTk.PhotoImage(preview_image)
            self.image_label.configure(image=photo, text="")
            self.image_label.image = photo  # Keep a reference
    
    def pixel_to_ascii(self, pixel_value):
        """Convert a pixel brightness value to ASCII character"""
        if self.black_as_space.get():
            # If black as space is enabled, very dark pixels become spaces
            if pixel_value < 25:  # Very dark pixels (threshold can be adjusted)
                return " "
            # Use remaining characters for other brightness levels
            chars = self.ascii_chars[1:]  # Skip the @ character
            index = int((pixel_value - 25) * (len(chars) - 1) / (255 - 25))
            index = max(0, min(index, len(chars) - 1))
            return chars[index]
        else:
            # Standard conversion
            index = int(pixel_value * (len(self.ascii_chars) - 1) / 255)
            return self.ascii_chars[index]
    
    def convert_frame_to_ascii(self, frame):
        """Convert a single frame to ASCII art"""
        try:
            # Get desired width
            width = int(self.width_var.get())
            if width <= 0:
                raise ValueError("Width must be positive")
            
            # Calculate height maintaining aspect ratio
            aspect_ratio = frame.height / frame.width
            height = int(width * aspect_ratio * 0.5)  # 0.5 to account for character height/width ratio
            
            # Resize image
            resized_image = frame.resize((width, height), Image.Resampling.LANCZOS)
            
            # Convert to grayscale
            gray_image = resized_image.convert('L')
            
            # Convert to ASCII
            ascii_lines = []
            for y in range(height):
                line = ""
                for x in range(width):
                    pixel_value = gray_image.getpixel((x, y))
                    line += self.pixel_to_ascii(pixel_value)
                ascii_lines.append(line)
            
            return "\n".join(ascii_lines)
            
        except Exception as e:
            raise e
    
    def convert_to_ascii(self):
        """Convert the loaded image to ASCII art"""
        if not self.original_image:
            self.update_status("⚠️ Please load an image first!", self.colors['warning'])
            messagebox.showwarning("Warning", "Please load an image first!")
            return
        
        try:
            if self.is_animated:
                self.update_status("🔄 Converting animated GIF to ASCII art...", self.colors['accent'])
                self.convert_animated_to_ascii()
            else:
                self.update_status("🔄 Converting image to ASCII art...", self.colors['accent'])
                self.convert_static_to_ascii()
                
        except ValueError as e:
            error_msg = f"❌ Invalid width value: {str(e)}"
            self.update_status(error_msg, self.colors['warning'])
            messagebox.showerror("Error", f"Invalid width value: {str(e)}")
        except Exception as e:
            error_msg = f"❌ Conversion failed: {str(e)}"
            self.update_status(error_msg, self.colors['warning'])
            messagebox.showerror("Error", f"Conversion failed: {str(e)}")
    
    def convert_static_to_ascii(self):
        """Convert a static image to ASCII art"""
        self.ascii_art = self.convert_frame_to_ascii(self.original_image)
        
        # Display ASCII art
        self.ascii_text.delete(1.0, tk.END)
        self.ascii_text.insert(1.0, self.ascii_art)
        
        width = int(self.width_var.get())
        height = int(width * (self.original_image.height / self.original_image.width) * 0.5)
        self.update_status(f"✨ ASCII art created! ({width}x{height} characters)", self.colors['success'])
    
    def convert_animated_to_ascii(self):
        """Convert an animated GIF to ASCII art frames"""
        self.ascii_frames = []
        self.frame_durations = []
        
        try:
            frame_count = self.original_image.n_frames
            
            for i in range(frame_count):
                self.original_image.seek(i)
                frame = self.original_image.copy()
                
                # Get frame duration (in milliseconds)
                duration = self.original_image.info.get('duration', 100)
                self.frame_durations.append(duration)
                
                # Convert frame to ASCII
                ascii_frame = self.convert_frame_to_ascii(frame)
                self.ascii_frames.append(ascii_frame)
                
                # Update progress
                progress = int((i + 1) / frame_count * 100)
                self.update_status(f"🔄 Processing frame {i + 1}/{frame_count} ({progress}%)", self.colors['accent'])
                self.root.update_idletasks()
            
            # Reset to first frame
            self.current_frame = 0
            self.display_current_frame()
            self.update_frame_info()
            
            width = int(self.width_var.get())
            height = int(width * (self.original_image.height / self.original_image.width) * 0.5)
            self.update_status(f"✨ Animated ASCII art created! {frame_count} frames ({width}x{height} characters each)", self.colors['success'])
            
        except Exception as e:
            raise e
    
    def display_current_frame(self):
        """Display the current ASCII frame"""
        if self.is_animated and self.ascii_frames and 0 <= self.current_frame < len(self.ascii_frames):
            self.ascii_text.delete(1.0, tk.END)
            self.ascii_text.insert(1.0, self.ascii_frames[self.current_frame])
    
    def update_frame_info(self):
        """Update the frame counter display"""
        if self.is_animated and self.ascii_frames:
            self.frame_info.config(text=f"Frame: {self.current_frame + 1} / {len(self.ascii_frames)}")
        else:
            self.frame_info.config(text="Frame: 0 / 0")
    
    def play_animation(self):
        """Start playing the ASCII animation"""
        if not self.ascii_frames:
            messagebox.showwarning("Warning", "No GIF animation to play! Please convert a GIF first.")
            return
        
        if not self.animation_running:
            self.animation_running = True
            self.animation_thread = threading.Thread(target=self._animation_loop, daemon=True)
            self.animation_thread.start()
            self.update_status("▶️ Animation playing...", self.colors['success'])
    
    def pause_animation(self):
        """Pause the ASCII animation"""
        self.animation_running = False
        self.update_status("⏸️ Animation paused", self.colors['warning'])
    
    def stop_animation(self):
        """Stop the ASCII animation and reset to first frame"""
        self.animation_running = False
        self.current_frame = 0
        self.display_current_frame()
        self.update_frame_info()
        self.update_status("⏹️ Animation stopped", self.colors['danger'])
    
    def prev_frame(self):
        """Go to previous frame"""
        if self.ascii_frames:
            self.current_frame = (self.current_frame - 1) % len(self.ascii_frames)
            self.display_current_frame()
            self.update_frame_info()
    
    def next_frame(self):
        """Go to next frame"""
        if self.ascii_frames:
            self.current_frame = (self.current_frame + 1) % len(self.ascii_frames)
            self.display_current_frame()
            self.update_frame_info()
    
    def _animation_loop(self):
        """Animation loop running in a separate thread"""
        while self.animation_running:
            delay = self.animation_speed.get() / 1000.0  # Convert to seconds
            time.sleep(delay)
            
            if self.animation_running:  # Check again after sleep
                if self.ascii_frames:
                    self.current_frame = (self.current_frame + 1) % len(self.ascii_frames)
                    # Update UI in main thread
                    self.root.after(0, self.display_current_frame)
                    self.root.after(0, self.update_frame_info)
    
    def save_ascii(self):
        """Save ASCII art to a text file"""
        if not self.ascii_art and not self.ascii_frames:
            self.update_status("⚠️ No ASCII art to save!", self.colors['warning'])
            messagebox.showwarning("Warning", "No ASCII art to save!")
            return
        
        if self.ascii_frames:
            # For animated ASCII, ask user what to save
            choice = messagebox.askyesnocancel(
                "Save Options",
                "Save all frames as separate files?\n\nYes: Save all frames\nNo: Save current frame only\nCancel: Cancel"
            )
            
            if choice is None:  # Cancel
                return
            elif choice:  # Yes - save all frames
                self.save_all_frames()
            else:  # No - save current frame
                self.save_current_frame()
        else:
            # Save single ASCII art
            self.save_single_ascii()
    
    def save_single_ascii(self):
        """Save single ASCII art"""
        file_path = filedialog.asksaveasfilename(
            title="Save ASCII art",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(self.ascii_art)
                filename = os.path.basename(file_path)
                self.update_status(f"💾 ASCII art saved as: {filename}", self.colors['success'])
                messagebox.showinfo("Success", f"ASCII art saved to {file_path}")
            except Exception as e:
                error_msg = f"❌ Failed to save file: {str(e)}"
                self.update_status(error_msg, self.colors['warning'])
                messagebox.showerror("Error", f"Failed to save file: {str(e)}")
    
    def save_current_frame(self):
        """Save current frame of animated ASCII"""
        if self.ascii_frames and 0 <= self.current_frame < len(self.ascii_frames):
            content = self.ascii_frames[self.current_frame]
        else:
            return
        
        file_path = filedialog.asksaveasfilename(
            title="Save current ASCII frame",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                filename = os.path.basename(file_path)
                self.update_status(f"💾 Current frame saved as: {filename}", self.colors['success'])
                messagebox.showinfo("Success", f"Current frame saved to {file_path}")
            except Exception as e:
                error_msg = f"❌ Failed to save file: {str(e)}"
                self.update_status(error_msg, self.colors['warning'])
                messagebox.showerror("Error", f"Failed to save file: {str(e)}")
    
    def save_all_frames(self):
        """Save all frames of animated ASCII"""
        if not self.ascii_frames:
            return
        
        folder_path = filedialog.askdirectory(title="Select folder to save all frames")
        
        if folder_path:
            try:
                base_name = os.path.splitext(os.path.basename(self.image_path or "animation"))[0]
                
                for i, frame in enumerate(self.ascii_frames):
                    file_path = os.path.join(folder_path, f"{base_name}_frame_{i+1:03d}.txt")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(frame)
                
                self.update_status(f"💾 All {len(self.ascii_frames)} frames saved!", self.colors['success'])
                messagebox.showinfo("Success", f"All {len(self.ascii_frames)} frames saved to {folder_path}")
            except Exception as e:
                error_msg = f"❌ Failed to save frames: {str(e)}"
                self.update_status(error_msg, self.colors['warning'])
                messagebox.showerror("Error", f"Failed to save frames: {str(e)}")
    
    def copy_to_clipboard(self):
        """Copy ASCII art to clipboard"""
        if self.ascii_frames and 0 <= self.current_frame < len(self.ascii_frames):
            # Copy current GIF frame
            current_ascii = self.ascii_frames[self.current_frame]
            self.root.clipboard_clear()
            self.root.clipboard_append(current_ascii)
            self.update_status("📋 Current ASCII frame copied to clipboard!", self.colors['success'])
            messagebox.showinfo("Success", "Current ASCII frame copied to clipboard!")
        elif self.ascii_art:
            # Copy single ASCII art
            self.root.clipboard_clear()
            self.root.clipboard_append(self.ascii_art)
            self.update_status("📋 ASCII art copied to clipboard!", self.colors['success'])
            messagebox.showinfo("Success", "ASCII art copied to clipboard!")
        else:
            self.update_status("⚠️ No ASCII art to copy!", self.colors['warning'])
            messagebox.showwarning("Warning", "No ASCII art to copy!")

def main():
    root = tk.Tk()
    
    # Set window icon (if you have an icon file)
    try:
        root.iconbitmap('icon.ico')  # Optional: add an icon file
    except:
        pass
    
    app = ASCIIArtConverter(root)
    root.mainloop()

if __name__ == "__main__":
    main()