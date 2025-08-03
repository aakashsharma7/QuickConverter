# QuickConvertor - All-in-One File Conversion Platform

A premium, high-fidelity SaaS web application offering smart tools for file conversion, editing, and processing. Built with modern web technologies and designed for professional use.

## 🚀 Features

### Core Tools
- **PDF Tools**: Editor, converter, merger, and more
- **Image Tools**: Format conversion, background removal, watermark removal, compression
- **Video & Audio**: Format conversion, audio extraction, compression
- **Utilities**: OCR text extraction, document conversion, batch processing

### Premium UI/UX
- ✨ Glassmorphism design with smooth animations
- 🌙 Dark/Light mode toggle
- 📱 Fully responsive design
- 🎯 Drag-and-drop file upload
- ⚡ Real-time progress indicators
- 🔄 Smooth page transitions
- 🎨 Micro-interactions and hover effects

### Technical Features
- 🔒 Secure file processing
- 📊 Real-time conversion status
- 🗂️ Batch file processing
- 🎯 100+ supported file formats
- ⚡ Lightning-fast processing
- 🔄 Background job processing

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Beautiful component library
- **Framer Motion** - Smooth animations and transitions

### Backend & Processing
- **Node.js** - Server-side runtime
- **Sharp** - High-performance image processing
- **PDF-lib** - PDF manipulation and editing
- **Tesseract.js** - OCR text extraction
- **FFmpeg.wasm** - Video/audio processing
- **Mammoth** - DOCX to HTML conversion
- **JSZip** - File compression utilities

### Database & Storage
- **Supabase** - PostgreSQL database and file storage
- **Row Level Security** - Secure data access
- **Real-time subscriptions** - Live updates

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quickconvertor.git
   cd quickconvertor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Create the following tables in your database:

   ```sql
   -- Files table
   CREATE TABLE files (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     size BIGINT NOT NULL,
     type TEXT NOT NULL,
     url TEXT NOT NULL,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     status TEXT DEFAULT 'uploading',
     conversion_type TEXT,
     original_format TEXT,
     target_format TEXT
   );

   -- Conversion jobs table
   CREATE TABLE conversion_jobs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     file_id UUID REFERENCES files(id) ON DELETE CASCADE,
     status TEXT DEFAULT 'pending',
     conversion_type TEXT NOT NULL,
     original_format TEXT NOT NULL,
     target_format TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completed_at TIMESTAMP WITH TIME ZONE,
     error_message TEXT,
     output_url TEXT
   );

   -- Storage bucket for uploads
   INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Gray scale with proper contrast
- **Accent**: Purple and teal for highlights
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Orange (#F59E0B)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Sizes**: Responsive scale from 12px to 64px

### Components
- Glassmorphism cards with backdrop blur
- Smooth hover animations
- Micro-interactions on all interactive elements
- Consistent spacing and border radius
- Accessible focus states

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔧 API Endpoints

### File Upload
```
POST /api/upload
Content-Type: multipart/form-data
```

### File Conversion
```
POST /api/convert
Content-Type: application/json
```

### Job Status
```
GET /api/convert?jobId={jobId}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with database
- **DigitalOcean**: App Platform deployment

## 🔒 Security Features

- File type validation
- File size limits
- Secure file storage with Supabase
- Row Level Security (RLS)
- Automatic file cleanup
- Rate limiting (implement as needed)

## 📊 Performance

- Image optimization with Sharp
- Lazy loading of components
- Efficient file processing
- CDN for static assets
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.quickconvertor.com](https://docs.quickconvertor.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/quickconvertor/issues)
- **Discord**: [Join our community](https://discord.gg/quickconvertor)

## 🙏 Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) for beautiful components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Supabase](https://supabase.com/) for backend services
- [Lucide Icons](https://lucide.dev/) for beautiful icons

---

Built with ❤️ by the QuickConvertor team 