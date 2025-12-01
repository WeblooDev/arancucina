'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Search,
  Download,
  Maximize,
  Minimize,
  MoreHorizontal,
} from 'lucide-react'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export default function TestPDF({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const [pageInput, setPageInput] = useState<string>('1')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 600,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [pdfDocument, setPdfDocument] = useState<any>(null)

  const flipBookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  const onDocumentLoadSuccess = ({ numPages, ...pdfDoc }: { numPages: number }) => {
    setNumPages(numPages)
    setPdfDocument(pdfDoc)
    setIsLoading(false)
  }

  const onPageLoadSuccess = (page: any) => {
    const { width, height } = page
    const aspectRatio = height / width
    const baseWidth = 400
    setPageSize({
      width: baseWidth,
      height: baseWidth * aspectRatio,
    })
  }

  // Calculate the flipbook page number from the PDF page number
  const getFlipBookPage = (pdfPage: number) => {
    // For the cover (page 1), we want flipbook page 0
    if (pdfPage === 1) return 0

    // For all other pages, we need to calculate based on the spread view
    // Page 2 -> flipbook page 1
    // Pages 3-4 -> flipbook page 2
    // Pages 5-6 -> flipbook page 3, etc.
    return Math.floor((pdfPage - 1) / 2) + (pdfPage % 2 === 0 ? 0 : 1)
  }

  // Calculate the PDF page number from the flipbook page
  const getPdfPage = (flipPage: number) => {
    // Flipbook page 0 is PDF page 1 (cover)
    if (flipPage === 0) return 1

    // For other flipbook pages:
    // Flipbook page 1 -> PDF page 2
    // Flipbook page 2 -> PDF page 3
    // Flipbook page 3 -> PDF page 5, etc.
    return flipPage === 1 ? 2 : flipPage * 2 - 1
  }

  const goToPage = (pdfPage: number) => {
    if (pdfPage >= 1 && pdfPage <= numPages && flipBookRef.current) {
      const flipPage = getFlipBookPage(pdfPage)
      flipBookRef.current.pageFlip().flip(flipPage)
      setCurrentPage(pdfPage)
      setPageInput(pdfPage.toString())
    }
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNumber = Number.parseInt(pageInput)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
      goToPage(pageNumber)
    }
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3))
    setPanOffset({ x: 0, y: 0 }) // Reset pan when zooming
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
    setPanOffset({ x: 0, y: 0 }) // Reset pan when zooming
  }

  const onFlip = (e: any) => {
    const flipPage = e.data
    const pdfPage = getPdfPage(flipPage)
    setCurrentPage(pdfPage)
    setPageInput(pdfPage.toString())
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading PDF...</p>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(e) => {
              console.error('Failed to load:', e)
              setIsLoading(false)
            }}
          >
            <Page pageNumber={1} width={1} onLoadSuccess={onPageLoadSuccess} />
          </Document>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center space-y-4 p-4 ${isFullscreen ? 'bg-black h-screen' : ''}`}
    >
      {/* Zoom Container */}
      <div
        ref={zoomContainerRef}
        className="relative overflow-hidden"
        style={{
          width: isFullscreen ? '100vw' : 'auto',
          height: isFullscreen ? 'calc(100vh - 100px)' : 'auto',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${panOffset.x / scale}px, ${panOffset.y / scale}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
        >
          {/* PDF Flipbook with shadow */}
          <div className="relative">
            {/* Book shadow
            <div
              className="absolute bg-black opacity-20 rounded-lg"
              style={{
                width: pageSize.width * 2 * scale + 20,
                height: pageSize.height * scale + 20,
                top: 10,
                left: 10,
                zIndex: -1,
              }}
            /> */}

            {/* Single Document instance */}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(e) => console.error('Failed to load:', e)}
              className="w-full h-full"
            >
              <HTMLFlipBook
                ref={flipBookRef}
                width={pageSize.width}
                height={pageSize.height}
                minWidth={200}
                maxWidth={1000}
                minHeight={300}
                maxHeight={1500}
                size="fixed"
                drawShadow={true}
                flippingTime={1000}
                usePortrait={true}
                startPage={0}
                onFlip={onFlip}
                className="shadow-lg"
                showCover={true}
                mobileScrollSupport={false}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                }}
                startZIndex={0}
                autoSize={false}
                maxShadowOpacity={0}
                clickEventForward={false}
                useMouseEvents={false}
                swipeDistance={0}
                showPageCorners={false}
                disableFlipByClick={false}
              >
                {/* PDF Pages */}
                {[...Array(numPages).keys()].map((index) => (
                  <div className="bg-white shadow-sm border border-gray-200" key={index}>
                    <Page
                      key={index}
                      pageNumber={index + 1}
                      width={pageSize.width}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onLoadSuccess={index === 0 ? onPageLoadSuccess : undefined}
                      loading={
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                        </div>
                      }
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </Document>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div
        className={`flex items-center space-x-2 p-3 rounded-lg shadow-sm ${isFullscreen ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
      >
        {/* First Page
        <Button
          variant={isFullscreen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          <SkipBack className="h-4 w-4" />
        </Button> */}

        {/* Previous Page */}
        <Button
          variant={isFullscreen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            // If we're on page 2, go to page 1 (cover)
            // Otherwise, go back 2 pages (previous spread)
            const prevPage = currentPage === 2 ? 1 : Math.max(1, currentPage - 2)
            goToPage(prevPage)
          }}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Input */}
        <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            className={`w-12 h-8 text-center text-sm ${isFullscreen ? 'bg-gray-700 text-white border-gray-600' : ''}`}
          />
          <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
            of {numPages}
          </span>
        </form>

        {/* Next Page */}
        <Button
          variant={isFullscreen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            // If we're on the cover (page 1), go to page 2
            // Otherwise, go forward 2 pages (next spread)
            const nextPage = currentPage === 1 ? 6 : Math.min(numPages, currentPage + 4)
            goToPage(nextPage)
          }}
          disabled={currentPage === numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page
        <Button
          variant={isFullscreen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => goToPage(numPages)}
          disabled={currentPage === numPages}
        >
          <SkipForward className="h-4 w-4" />
        </Button> */}

        {/* Divider */}
        <div className={`h-6 w-px mx-2 ${isFullscreen ? 'bg-gray-600' : 'bg-gray-300'}`} />

        {/* Zoom Out */}
        <Button
          variant={isFullscreen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={zoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        {/* Zoom In */}
        <Button
          variant={isFullscreen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={zoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Zoom Percentage */}
        <span
          className={`text-sm min-w-[3rem] ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {Math.round(scale * 100)}%
        </span>

        {/* Divider */}
        <div className={`h-6 w-px mx-2 ${isFullscreen ? 'bg-gray-600' : 'bg-gray-300'}`} />

        {/* Search
        <Button variant={isFullscreen ? "secondary" : "ghost"} size="sm">
          <Search className="h-4 w-4" />
        </Button> */}

        {/* Download */}
        <Button variant={isFullscreen ? 'secondary' : 'ghost'} size="sm">
          <Download className="h-4 w-4" />
        </Button>

        {/* Fullscreen */}
        <Button variant={isFullscreen ? 'secondary' : 'ghost'} size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        {/* More Options
        <Button variant={isFullscreen ? "secondary" : "ghost"} size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button> */}
      </div>
    </div>
  )
}
