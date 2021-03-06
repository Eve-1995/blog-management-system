import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppArticleDetailService } from './article-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { AppArticleDetailReplyComponent } from './article-detail-reply.component';
import { AppGlobalService } from '../../service/global.service';
import { AppSettingService } from '../../service/setting.service';
import { AppConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['article-detail.component.scss'],
  providers: [AppArticleDetailService],
})
export class AppArticleDetailComponent implements OnInit {
  public focus = false;
  public loading = true;
  public hasCollection = false;
  public hasLike = false;
  public comments;
  public commentContent = '';
  public articleDetail = {
    id: undefined,
    name: undefined,
    createTime: undefined,
    updateTime: undefined,
    content: undefined,
    likeAmount: undefined,
    collectAmount: undefined,
    commentAmount: undefined,
  };

  private articleId: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: AppArticleDetailService,
    private globalService: AppGlobalService,
    private settingService: AppSettingService,
    private dialogService: NbDialogService,
    public toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.id) {
        this.articleId = queryParams.id;
        this.getArticleInfo();
        this.getComments();
      }
    });
  }

  // 执行收藏或取消收藏操作
  public collect() {
    if (this.hasCollection) {
      this.dialogService.open(AppConfirmComponent, { context: { content: '确认要取消收藏吗?' } }).onClose.subscribe((v: string) => {
        if (v) {
          this.service.collect(this.articleDetail.id).subscribe(() => {
            this.getArticleInfo();
          });
        }
      });
    } else {
      this.service.collect(this.articleDetail.id).subscribe(() => {
        this.getArticleInfo();
      });
    }
  }

  // 执行点赞或取消点赞操作
  public like() {
    if (this.hasLike) {
      this.dialogService.open(AppConfirmComponent, { context: { content: '确认要取消点赞吗?' } }).onClose.subscribe((v: string) => {
        if (v) {
          this.service.like(this.articleDetail.id).subscribe(() => {
            this.getArticleInfo();
          });
        }
      });
    } else {
      this.service.like(this.articleDetail.id).subscribe(() => {
        this.getArticleInfo();
      });
    }
  }

  // 评论输入框的失焦事件
  public onBlur() {
    if (this.commentContent.trim().length > 0) {
      this.focus = true;
    } else {
      this.focus = false;
      this.commentContent = '';
    }
  }

  // 提交评论
  public doComment() {
    if (this.commentContent.trim().length > 0) {
      this.focus = false;
      this.service.saveComment(this.commentContent, this.articleId).subscribe(() => {
        this.getComments();
        this.commentContent = '';
        this.getArticleInfo();
      });
    }
  }

  // 快捷键 ctrl+enter 即可提交评论
  public keyUpHandler(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.ctrlKey) {
      this.doComment();
    }
  }

  // 弹出评论回复框
  public doReply(fromUser: string, parentCommentId: number, rootCommentId: number) {
    this.globalService.refreshMaskState(true);
    this.dialogService.open(AppArticleDetailReplyComponent, { context: { fromUser }, closeOnEsc: false, hasBackdrop: false }).onClose.subscribe((v: { replyContent: string }) => {
      if (v) {
        this.service.saveComment(v.replyContent, this.articleId, parentCommentId, rootCommentId).subscribe(() => {
          this.getComments();
        });
      }
      this.globalService.refreshMaskState(false);
    });
  }

  /**
   * 获取'文章'的评论内容
   */
  private getComments() {
    this.service.getCommentsByArticle(this.articleId).subscribe(v => {
      this.comments = v;
      this.loading = false;
    });
  }

  /**
   * 获取'文章'的基本信息
   */
  private getArticleInfo() {
    this.service.findBasicInfo(this.articleId).subscribe(value => {
      this.articleDetail = value;
      this.getActionStatus();
    });
  }

  /**
   * 判断用户是否已点赞、已收藏
   */
  private getActionStatus() {
    if (!!this.settingService.user) {
      this.service.actionStatus(this.articleDetail.id).subscribe((v: { hasCollect: boolean, hasLike: boolean }) => {
        this.hasCollection = v.hasCollect ? true : false;
        this.hasLike = v.hasLike ? true : false;
      });
    }
  }

  // 设置粘贴板文本内容
  get copyContent() {
    return `${this.articleDetail.name} - Eve\n${location.href}`;
  }
}
