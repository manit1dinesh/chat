import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { io } from "socket.io-client";
import { ModalController } from '@ionic/angular';
import { DataSharingService } from '../services/data-sharing.service';
import { SocialLoginPage } from '../social-login/social-login.page';

@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.page.html',
  styleUrls: ['./videocall.page.scss'],
})
export class VideocallPage implements OnInit, AfterViewInit {
  socket = io("http://localhost:3000");
  roomNumber;
  localStream;
  remoteStream;
  rtcPeerConnection;
  isCaller = true;
  full = false;

  isRecording = false;
  mediaRecorder;
  localScreenStream;
  chunks = [];


  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('videoScreenEl') videoScreenEl: ElementRef
  @ViewChild('downloadLink') downloadLink: ElementRef

  iceServers = {
    iceServers: [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' }
    ],
  }

  localStreamConstraints = {
    video: { width: 360, height: 740 },
    audio: { echoCancellation: true, noiseSuppression: true }
  }
  remoteStreamConstraints = {
    video: { width: 95, height: 140 },
    audio: { echoCancellation: true, noiseSuppression: true }
  }

  constructor(private renderer: Renderer2, private modalController: ModalController, private dataSharingServices: DataSharingService) { }

  ngAfterViewInit(): void {
    console.log('hi');
    this.socket.on('created', room => {
      navigator.mediaDevices.getUserMedia(this.localStreamConstraints)
        .then(stream => {
          this.localStream = stream;
          this.localVideo.nativeElement.srcObject = stream;
          this.isCaller = true;
        })
        .catch(err => { console.log('error in capturing video', err) })
    });

    this.socket.on('joined', room => {
      console.log('joined');
      navigator.mediaDevices.getUserMedia(this.remoteStreamConstraints)
        .then(stream => {
          this.localStream = stream;
          this.localVideo.nativeElement.srcObject = stream;
          this.socket.emit('ready', this.roomNumber);
        })
        .catch(err => { console.log('error in capturing video', err) })
    });

    this.socket.on('ready', () => {
      console.log('ready out', this.isCaller);
      if (this.isCaller == true) {
        console.log('ready in');
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = event => onIceCandidate(event);
        this.rtcPeerConnection.ontrack = event => onAddStream(event);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[0], this.localStream);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[1], this.localStream);
        this.rtcPeerConnection.createOffer()
          .then(sessionDescription => {
            console.log('sending offer', sessionDescription);
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            this.socket.emit('offer', {
              type: 'offer',
              sdp: sessionDescription,
              room: this.roomNumber
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    });

    this.socket.on('offer', (event) => {
      console.log('offer out', !this.isCaller);
      if (!this.isCaller == false) {
        console.log('offer in');
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = event => onIceCandidate(event);
        this.rtcPeerConnection.ontrack = event => onAddStream(event);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[0], this.localStream);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[1], this.localStream);
        console.log('recieved offer', event);
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        this.rtcPeerConnection.createAnswer()
          .then(sessionDescription => {
            console.log('sending answer', sessionDescription);
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            this.socket.emit('answer', {
              type: 'answer',
              sdp: sessionDescription,
              room: this.roomNumber
            });
            console.log('answer');
          })
          .catch(err => {
            console.log(err);
          });
      }
    })

    this.socket.on('answer', (event) => {
      console.log('recieved answer', event);
      this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    });

    this.socket.on('candidate', event => {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        sdpMid: event.id,
        candidate: event.candidate
      });
      console.log('recieved candidate', candidate)
      this.rtcPeerConnection.addIceCandidate(candidate);
    });

    const onAddStream = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
      this.remoteStream = event.streams[0];
    }


    const onIceCandidate = (event) => {
      if (event.candidate) {
        console.log('sending ice candidate', event.candidate);
        this.socket.emit('candidate', {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          room: this.roomNumber,
        });
      }
    }
  }

  ngOnInit() {
    console.log('hello');
    console.log(this.dataSharingServices.userData);
    this.dataSharingServices.userData.subscribe(uid => {
      const roomNumber = uid;
      console.log(uid);
    });
    this.socket.emit('createOrJoin', 'room'); 

  }

  dismiss() {
    this.modalController.dismiss();
  }
}
