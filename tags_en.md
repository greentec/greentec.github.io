---
layout: page
permalink: /tags_en/
title: Tags
lang: en
ref: tags
---

<ul class="tag-cloud">
{% for tag in site.tags %}
  <span style="font-size: {{ tag | last | size | times: 100 | divided_by: site.tags.size | plus: 70  }}%">
    <a href="#{{ tag | first | slugize }}">
      {{ tag | first }}
    </a> &nbsp;&nbsp;
  </span>
{% endfor %}
</ul>

<div id="archives">
{% for tag in site.tags %}
  <div class="archive-group">
    {% capture tag_name %}{{ tag | first }}{% endcapture %}
    <h3 id="#{{ tag_name | slugize }}">{{ tag_name }}</h3>
    <a name="{{ tag_name | slugize }}"></a>
    {% for post in site.tags[tag_name] %}
      {% if post.lang == page.lang %}
        <article class="archive-item">
          <h4><span class="post-date">{{ post.date | date_to_string }} • <a href="{{ root_url }}{{ post.url }}">{{post.title}}</a></span></h4>
        </article>
      {% endif %}
    {% endfor %}
  </div>
{% endfor %}
</div>
