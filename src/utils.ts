import queryString from "query-string";

interface ImageElement extends Element {
  src?: string;
}

interface AnchorElement extends Element {
  href?: string;
}

interface HeadingElement extends Element {
  innerText?: string;
}

enum cardIcons {
  "ASSIGN" = "https://open.yonsei.ac.kr/theme/image.php/coursemosv2/assign/1615804288/icon",
  "VOD" = "https://open.yonsei.ac.kr/theme/image.php/coursemosv2/vod/1615804288/icon",
}

export class CardParser {
  cardElement: Element;
  cardType: string | null = null;
  cardDates: Date[] = [];
  cardTitle: string = "";
  courseName: string;

  constructor(cardElement: Element, courseName: string) {
    this.cardElement = cardElement;
    this.courseName = courseName;
    this.getCardType();
    this.getCardDates();
    this.getCardTitle();
  }

  getCardType = () => {
    const iconElement: ImageElement = this.cardElement.getElementsByClassName(
      "icon "
    )[0];
    if (!iconElement) return;
    switch (iconElement.src) {
      case cardIcons.ASSIGN:
        this.cardType = "ASSIGN";
        break;
      case cardIcons.VOD:
        this.cardType = "VOD";
    }
  };

  getCardDates = () => {
    const DateElements: HTMLCollectionOf<Element> = this.cardElement.getElementsByClassName(
      "date-link"
    );
    Array.from(DateElements).map((el: Element) => {
      const anchor: AnchorElement = el.children[0];
      if (!anchor) return null;
      const href = anchor.href;
      if (!href) return null;
      const parsed = queryString.parse(href);
      const { time } = parsed;
      this.cardDates.unshift(new Date(parseInt(time as string) * 1000));
    });
  };

  getCardTitle = () => {
    if (this.cardType === cardIcons.ASSIGN) return "과제";
    const TitleElement: HeadingElement = this.cardElement.getElementsByTagName(
      "h3"
    )[0];
    this.cardTitle = TitleElement?.innerText ?? "";
  };
}
