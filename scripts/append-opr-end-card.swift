import AVFoundation
import AppKit
import CoreVideo
import Foundation

struct ReleaseAsset {
  let source: URL
  let output: URL
  let poster: URL
}

let outputDirectory = URL(fileURLWithPath: ".tmp/october-dave-rubble-release", isDirectory: true)
let endCardURL = URL(fileURLWithPath: "/Users/chatenoberoi-morris/Desktop/OPR/otherpeoplesrecipes-website/opr-platform/artifacts/opr-social-end-card.png")

let assets = [
  ReleaseAsset(
    source: URL(fileURLWithPath: "/Users/chatenoberoi-morris/Downloads/gemini_generated_video_74830cfb.mp4"),
    output: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-finishing-touch-v1.mp4"),
    poster: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-finishing-touch-poster.jpg")
  ),
  ReleaseAsset(
    source: URL(fileURLWithPath: "/Users/chatenoberoi-morris/Downloads/gemini_generated_video_c7cc40ec.mp4"),
    output: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-carrot-v1.mp4"),
    poster: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-carrot-poster.jpg")
  ),
  ReleaseAsset(
    source: URL(fileURLWithPath: "/Users/chatenoberoi-morris/Downloads/gemini_generated_video_4a21fdcd.mp4"),
    output: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-simmer-v1.mp4"),
    poster: outputDirectory.appendingPathComponent("opr-dave-and-rubble-the-simmer-poster.jpg")
  ),
]

enum ReleaseError: Error {
  case missingTrack(String)
  case cannotCreateWriter
  case cannotCreatePixelBuffer
  case cannotCreateContext
}

func makeEndCardMovie(at url: URL, imageURL: URL, size: CGSize) async throws {
  try? FileManager.default.removeItem(at: url)
  let writer = try AVAssetWriter(outputURL: url, fileType: .mp4)
  let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(size.width),
    AVVideoHeightKey: Int(size.height),
  ]
  let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
  input.expectsMediaDataInRealTime = false
  let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
      kCVPixelBufferWidthKey as String: Int(size.width),
      kCVPixelBufferHeightKey as String: Int(size.height),
    ]
  )
  guard writer.canAdd(input) else { throw ReleaseError.cannotCreateWriter }
  writer.add(input)
  guard writer.startWriting() else { throw writer.error ?? ReleaseError.cannotCreateWriter }
  writer.startSession(atSourceTime: .zero)

  guard let image = NSImage(contentsOf: imageURL),
        let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    throw ReleaseError.cannotCreateContext
  }

  let frameRate: Int32 = 24
  for index in 0..<(Int(frameRate) * 3) {
    while !input.isReadyForMoreMediaData {
      try await Task.sleep(nanoseconds: 5_000_000)
    }
    var buffer: CVPixelBuffer?
    guard CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer) == kCVReturnSuccess,
          let pixelBuffer = buffer else { throw ReleaseError.cannotCreatePixelBuffer }
    CVPixelBufferLockBaseAddress(pixelBuffer, [])
    guard let context = CGContext(
      data: CVPixelBufferGetBaseAddress(pixelBuffer),
      width: Int(size.width),
      height: Int(size.height),
      bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else { throw ReleaseError.cannotCreateContext }
    context.draw(cgImage, in: CGRect(origin: .zero, size: size))
    CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
    let time = CMTime(value: Int64(index), timescale: frameRate)
    guard adaptor.append(pixelBuffer, withPresentationTime: time) else {
      throw writer.error ?? ReleaseError.cannotCreateWriter
    }
  }
  input.markAsFinished()
  await writer.finishWriting()
  guard writer.status == .completed else { throw writer.error ?? ReleaseError.cannotCreateWriter }
}

func export(_ composition: AVMutableComposition, to output: URL) async throws {
  try? FileManager.default.removeItem(at: output)
  guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    throw ReleaseError.cannotCreateWriter
  }
  try await exporter.export(to: output, as: .mp4)
}

func writePoster(from asset: AVAsset, to output: URL) async throws {
  let generator = AVAssetImageGenerator(asset: asset)
  generator.appliesPreferredTrackTransform = true
  let image = try generator.copyCGImage(at: CMTime(seconds: 4.5, preferredTimescale: 600), actualTime: nil)
  let nsImage = NSImage(cgImage: image, size: .zero)
  let rep = NSBitmapImageRep(data: nsImage.tiffRepresentation!)!
  try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.92])!.write(to: output)
}

try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
let endCardMovie = outputDirectory.appendingPathComponent("opr-green-end-card.mp4")

for release in assets {
  let sourceAsset = AVURLAsset(url: release.source)
  let sourceDuration = try await sourceAsset.load(.duration)
  let sourceVideo = try await sourceAsset.loadTracks(withMediaType: .video).first
  guard let sourceVideo else { throw ReleaseError.missingTrack(release.source.lastPathComponent) }
  let sourceSize = try await sourceVideo.load(.naturalSize)

  if !FileManager.default.fileExists(atPath: endCardMovie.path) {
    try await makeEndCardMovie(at: endCardMovie, imageURL: endCardURL, size: sourceSize)
  }

  let endCardAsset = AVURLAsset(url: endCardMovie)
  guard let endCardVideo = try await endCardAsset.loadTracks(withMediaType: .video).first else {
    throw ReleaseError.missingTrack("green end card")
  }

  let composition = AVMutableComposition()
  guard let compositionVideo = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
    throw ReleaseError.missingTrack("composition video")
  }
  try compositionVideo.insertTimeRange(CMTimeRange(start: .zero, duration: sourceDuration), of: sourceVideo, at: .zero)
  let endCardDuration = try await endCardAsset.load(.duration)
  try compositionVideo.insertTimeRange(CMTimeRange(start: .zero, duration: endCardDuration), of: endCardVideo, at: sourceDuration)

  if let sourceAudio = try await sourceAsset.loadTracks(withMediaType: .audio).first,
     let compositionAudio = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
    try compositionAudio.insertTimeRange(CMTimeRange(start: .zero, duration: sourceDuration), of: sourceAudio, at: .zero)
  }

  try await export(composition, to: release.output)
  try await writePoster(from: sourceAsset, to: release.poster)
  let result = AVURLAsset(url: release.output)
  let resultDuration = try await result.load(.duration)
  let hasAudio = !(try await result.loadTracks(withMediaType: .audio)).isEmpty
  print("\(release.output.lastPathComponent) duration=\(CMTimeGetSeconds(resultDuration)) hasAudio=\(hasAudio)")
}
